// Erzeugt alle Dateien, die aus Manuskripten und Buchdaten abgeleitet werden:
//   src/downloads/<datei>.epub / .pdf      Downloads. Josies eigene Dateien aus manuskripte/ werden übernommen
//                                         (EPUB mit korrigierten Metadaten); fehlende werden erzeugt
//                                         (PDF als A5-Buch mit Typst, EPUB mit pandoc).
//   src/assets/og/<slug>.png, start.png   Vorschaubilder für geteilte Links (1200 × 630)
//   src/assets/icons/apple-touch-icon.png, favicon-32.png
//
// Braucht typst, pandoc, zip und unzip (macOS: brew install typst pandoc).
// Aufruf: npm run assets  (vorher: npm run manuskripte)

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import yaml from "js-yaml";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const manuskripteDir = path.join(root, "manuskripte");
const downloadsDir = path.join(root, "src/downloads");
const vorlagen = path.join(root, "scripts/typst");
const schriften = path.join(root, "scripts/schriften");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "matcheque-"));

const site = yaml.load(fs.readFileSync(path.join(root, "src/_data/site.yaml"), "utf8"));
const manuskripte = JSON.parse(fs.readFileSync(path.join(root, "src/_data/manuskripte.json"), "utf8"));
const buecherDir = path.join(root, "src/_data/buecher");
const buecher = fs
  .readdirSync(buecherDir)
  .filter((f) => f.endsWith(".yaml"))
  .map((f) => yaml.load(fs.readFileSync(path.join(buecherDir, f), "utf8")))
  .sort((a, b) => a.reihenfolge - b.reihenfolge);

const jahr = new Date().getFullYear();
const domain = site.url.replace("https://", "");
const zahl = (n) => new Intl.NumberFormat("de-DE").format(n);
const rechte = `© ${jahr} ${site.name}. Lizenz: CC BY-NC-ND 4.0 – Weitergabe mit Namensnennung erlaubt, nicht kommerziell, ohne Bearbeitung. ${domain}`;

// Typst-Vorlage mit eigenen Daten in einem frischen Arbeitsordner übersetzen.
function typst(vorlage, daten, ziel, { png = false, inhalt } = {}) {
  const ordner = fs.mkdtempSync(path.join(tmp, "job-"));
  for (const f of fs.readdirSync(vorlagen)) fs.copyFileSync(path.join(vorlagen, f), path.join(ordner, f));
  fs.writeFileSync(path.join(ordner, "daten.json"), JSON.stringify(daten));
  if (inhalt) fs.writeFileSync(path.join(ordner, "inhalt.typ"), inhalt);
  execFileSync("typst", [
    "compile", "--root", ordner, "--font-path", schriften, "--ignore-system-fonts",
    ...(png ? ["--format", "png", "--ppi", "72"] : []),
    path.join(ordner, vorlage), ziel,
  ], { stdio: "inherit" });
}

// EPUB übernehmen: Metadaten (Rechte, Verlag, Autorin) korrigieren und sauber neu verpacken.
function epubUebernehmen(quelle, ziel) {
  const ordner = fs.mkdtempSync(path.join(tmp, "epub-"));
  execFileSync("unzip", ["-q", "-o", quelle, "-d", ordner]);
  let basis = ordner;
  if (!fs.existsSync(path.join(basis, "mimetype"))) {
    // Falls die Datei einen zusätzlichen Ordner enthält (Mac „Komprimieren“): eine Ebene tiefer suchen.
    const innen = fs.readdirSync(ordner).map((d) => path.join(ordner, d)).find((d) => fs.existsSync(path.join(d, "mimetype")));
    if (!innen) throw new Error(`${quelle}: kein gültiges EPUB`);
    basis = innen;
  }
  const container = fs.readFileSync(path.join(basis, "META-INF/container.xml"), "utf8");
  const opfPfad = path.join(basis, container.match(/full-path="([^"]+)"/)[1]);
  let opf = fs.readFileSync(opfPfad, "utf8");
  opf = opf
    .replace(/<dc:rights>[\s\S]*?<\/dc:rights>/, `<dc:rights>${rechte}</dc:rights>`)
    .replace(/<dc:publisher>[\s\S]*?<\/dc:publisher>/, "<dc:publisher></dc:publisher>")
    .replace(/<dc:creator([^>]*)>[\s\S]*?<\/dc:creator>/, `<dc:creator$1>${site.name}</dc:creator>`)
    .replace(/<dc:identifier([^>]*) opf:scheme="ISBN"([^>]*)>[^<]*<\/dc:identifier>/, (m, a, b) => `<dc:identifier${a}${b}>urn:matcheque:${path.basename(ziel, ".epub")}</dc:identifier>`);
  fs.writeFileSync(opfPfad, opf);
  fs.rmSync(ziel, { force: true });
  const andere = fs.readdirSync(basis).filter((f) => f !== "mimetype" && !f.startsWith("."));
  execFileSync("zip", ["-X0q", ziel, "mimetype"], { cwd: basis });
  execFileSync("zip", ["-X9rq", ziel, ...andere, "-x", "*.DS_Store"], { cwd: basis });
}

const buchDaten = (b) => ({
  autorin: site.name,
  titel: b.titel,
  untertitel: b.untertitel || "",
  gattung: b.gattung,
  farbe: b.farbe,
  satz: b.ersterSatz || manuskripte[b.slug]?.ersterSatz || "",
  url: domain,
});

try {
  fs.mkdirSync(path.join(root, "src/assets/og"), { recursive: true });
  fs.rmSync(downloadsDir, { recursive: true, force: true });
  fs.mkdirSync(downloadsDir, { recursive: true });

  console.log("· Vorschaubilder");
  typst("og.typ", { art: "start", autorin: site.name, unterzeile: `${site.motto} · ${site.leitsatz}`, url: domain, buecher: buecher.map(buchDaten) }, path.join(root, "src/assets/og/start.png"), { png: true });
  for (const b of buecher) typst("og.typ", { art: "buch", ...buchDaten(b) }, path.join(root, `src/assets/og/${b.slug}.png`), { png: true });

  for (const b of buecher) {
    const m = manuskripte[b.slug];
    const vollstaendig = b.lesen?.umfang === "vollstaendig";
    const basisName = vollstaendig ? b.slug : `${b.slug}-leseprobe`;
    const epubZiel = path.join(downloadsDir, `${basisName}.epub`);
    const pdfZiel = path.join(downloadsDir, `${basisName}.pdf`);
    const quelle = (name) => (name ? path.join(manuskripteDir, name) : null);
    console.log(`· ${b.titel}`);

    const anzahlKapitel = m?.leseprobe?.kapitel.length ?? 0;
    const angabe = b.lesen?.angabe || (vollstaendig ? "Vollständiger Text" : `Kapitel 1–${anzahlKapitel} von ${m?.kapitelAnzahl}`);
    const ende = vollstaendig
      ? site.nachDerLeseprobe
      : `Das vollständige Manuskript umfasst ${zahl(b.woerter ?? m.woerter)} Wörter und ${b.normseiten ? "" : "etwa "}${zahl(b.normseiten ?? m.normseitenGeschaetzt)} Normseiten. Agenturen und Verlage erhalten es auf Anfrage: ${site.email}. ${site.nachDerLeseprobe}`;

    // EPUB
    const epubQuelle = quelle(b.dateien?.epub);
    if (epubQuelle && fs.existsSync(epubQuelle)) {
      epubUebernehmen(epubQuelle, epubZiel);
      console.log(`  EPUB übernommen: ${b.dateien.epub}`);
    } else if (m) {
      const cover = path.join(tmp, `${b.slug}-cover.png`);
      typst("cover.typ", buchDaten(b), cover, { png: true });
      const text = fs.readFileSync(path.join(root, `src/_includes/leseproben/${b.slug}.html`), "utf8");
      const motto = m.motto?.length ? `<blockquote class="motto"><p>${m.motto.join("<br/>")}</p></blockquote>\n` : "";
      const html = path.join(tmp, `${b.slug}.html`);
      fs.writeFileSync(html, `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${b.titel}</title></head><body>\n${motto}${text}\n<section class="ende"><h1>${vollstaendig ? "Ende" : "Ende der Leseprobe"}</h1><p>${ende}</p><p class="rechte">${rechte}</p></section>\n</body></html>`);
      execFileSync("pandoc", [
        html, "--from=html", "--to=epub3", `--output=${epubZiel}`, `--epub-cover-image=${cover}`,
        `--css=${path.join(root, "scripts/epub.css")}`, "--split-level=1", "--toc-depth=2",
        `--metadata=title:${b.titel}`, `--metadata=subtitle:${vollstaendig ? b.untertitel || "" : "Leseprobe"}`,
        `--metadata=author:${site.name}`, "--metadata=lang:de-DE", `--metadata=rights:${rechte}`,
        `--metadata=identifier:urn:matcheque:${basisName}`, `--metadata=date:${jahr}`,
      ], { stdio: "inherit" });
      console.log("  EPUB erzeugt");
    }

    // PDF
    const pdfQuelle = quelle(b.dateien?.pdf);
    if (pdfQuelle && fs.existsSync(pdfQuelle)) {
      fs.copyFileSync(pdfQuelle, pdfZiel);
      fs.chmodSync(pdfZiel, 0o644);
      console.log(`  PDF übernommen: ${b.dateien.pdf}`);
    } else if (m) {
      // Kapitel-Sections entfernen (sonst Blöcke ohne erlaubte Seitenumbrüche), Kapitel-Untertitel markieren.
      const html = fs
        .readFileSync(path.join(root, `src/_includes/leseproben/${b.slug}.html`), "utf8")
        .replace(/<\/?section[^>]*>/g, "")
        .replace(/<p class="kapitel-untertitel">([\s\S]*?)<\/p>/g, "<p>ZZUNTERTITELZZ$1</p>");
      const inhalt = execFileSync("pandoc", ["--from=html", "--to=typst", "--wrap=none"], { input: html, encoding: "utf8" })
        .replace(/^ZZUNTERTITELZZ(.*)$/gm, "#untertitel[$1]");
      // Eingebundene Typst-Dateien sehen die Definitionen der Vorlage nicht: hier mitgeben.
      const vorspann = [
        "#let grau = luma(85)",
        "#let untertitel(body) = block(width: 100%, above: -4mm, below: 9mm, align(center, text(fill: grau, size: 9.5pt, tracking: 0.08em, smallcaps(lower(body)))))",
        '#let horizontalrule = align(center, block(above: 1.1em, below: 1.1em, text(fill: grau, "⁂")))',
      ].join("\n");
      typst("leseprobe.typ", {
        ...buchDaten(b),
        motto: m.motto || [],
        angabe,
        art: vollstaendig ? "" : "Leseprobe",
        mitTeilen: !!m.leseprobe.mitTeilen,
        ende: vollstaendig ? "" : ende,
        rechte,
      }, pdfZiel, { inhalt: `${vorspann}\n\n${inhalt}` });
      console.log("  PDF erzeugt (Typst, A5)");
    }
  }

  console.log("· Icons");
  const svg = fs.readFileSync(path.join(root, "src/assets/icons/favicon.svg"), "utf8").replace(/<style>[\s\S]*?<\/style>/, "");
  const icon = (groesse, rand) =>
    Buffer.from(
      svg
        .replace("<path", `<rect width="32" height="32" fill="#f3eee3"/><path fill="#231d18" transform="translate(${rand} ${rand}) scale(${(32 - 2 * rand) / 32})"`)
        .replace('viewBox="0 0 32 32"', `viewBox="0 0 32 32" width="${groesse}" height="${groesse}"`)
    );
  await sharp(icon(180, 4)).png().toFile(path.join(root, "src/assets/icons/apple-touch-icon.png"));
  await sharp(icon(32, 0)).png().toFile(path.join(root, "src/assets/icons/favicon-32.png"));

  console.log("✓ fertig. Danach `npm start` oder `npm run build`.");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
