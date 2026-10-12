// Erzeugt alle Dateien, die aus Manuskript und Buchdaten abgeleitet werden:
//   src/assets/og/<slug>.png, start.png      Vorschaubilder für geteilte Links (1200 × 630)
//   src/downloads/<slug>-leseprobe.pdf          Leseprobe als A5-Buch (Typst)
//   src/downloads/<slug>-leseprobe.epub         Leseprobe als EPUB 3 (pandoc), Titelblatt als Cover
//   src/assets/icons/apple-touch-icon.png, favicon-32.png
//
// Braucht typst und pandoc (macOS: brew install typst pandoc).
// Aufruf: npm run assets  (vorher: npm run manuskripte)

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import yaml from "js-yaml";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
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
const ohneTodo = (s) => (s && !String(s).startsWith("TODO") ? String(s) : "");
const zahl = (n) => new Intl.NumberFormat("de-DE").format(n);

// Typst-Vorlage mit eigenen Daten in einem frischen Arbeitsordner übersetzen.
function typst(vorlage, daten, ziel, { png = false, inhalt } = {}) {
  const ordner = fs.mkdtempSync(path.join(tmp, "job-"));
  for (const f of fs.readdirSync(vorlagen)) fs.copyFileSync(path.join(vorlagen, f), path.join(ordner, f));
  fs.writeFileSync(path.join(ordner, "daten.json"), JSON.stringify(daten));
  if (inhalt) fs.writeFileSync(path.join(ordner, "inhalt.typ"), inhalt);
  execFileSync("typst", [
    "compile",
    "--root", ordner,
    "--font-path", schriften,
    "--ignore-system-fonts",
    ...(png ? ["--format", "png", "--ppi", "72"] : []),
    path.join(ordner, vorlage),
    ziel,
  ], { stdio: "inherit" });
}

const buchDaten = (b) => ({
  autorin: site.name,
  titel: b.titel,
  untertitel: b.untertitel || "",
  gattung: b.gattung,
  farbe: b.farbe,
  satz: ohneTodo(b.ersterSatz) || manuskripte[b.slug]?.ersterSatz || "",
  url: domain,
});

try {
  fs.mkdirSync(path.join(root, "src/assets/og"), { recursive: true });
  fs.mkdirSync(path.join(root, "src/downloads"), { recursive: true });

  console.log("· Vorschaubilder");
  typst("og.typ", { art: "start", autorin: site.name, unterzeile: site.unterzeile, url: domain, buecher: buecher.map(buchDaten) }, path.join(root, "src/assets/og/start.png"), { png: true });
  for (const b of buecher) {
    typst("og.typ", { art: "buch", ...buchDaten(b) }, path.join(root, `src/assets/og/${b.slug}.png`), { png: true });
  }

  for (const b of buecher.filter((b) => manuskripte[b.slug])) {
    const m = manuskripte[b.slug];
    const normseiten = b.normseiten ?? m.normseitenGeschaetzt;
    console.log(`· Leseprobe ${b.titel}`);
    const quelle = path.join(root, `src/_includes/leseproben/${b.slug}.html`);
    const ende = `Das vollständige Manuskript umfasst ${m.kapitelAnzahl} Kapitel und ${b.normseiten ? "" : "etwa "}${zahl(normseiten)} Normseiten. Agenturen und Verlage erhalten es auf Anfrage: ${site.email}`;
    const rechte = `© ${jahr} ${site.name}. Alle Rechte vorbehalten. Diese Leseprobe darf für den persönlichen Gebrauch gelesen, aber nicht weitergegeben, hochgeladen oder verkauft werden. ${domain}`;

    // PDF: Kapitel-Sections entfernen, sonst setzt pandoc sie in Blöcke, in denen keine Seitenumbrüche erlaubt sind.
    const ohneSections = fs.readFileSync(quelle, "utf8").replace(/<\/?section[^>]*>/g, "");
    const inhalt = execFileSync("pandoc", ["--from=html", "--to=typst"], { input: ohneSections, encoding: "utf8" });
    typst("leseprobe.typ", {
      ...buchDaten(b),
      motto: m.motto || [],
      angabe: `${m.leseprobe.kapitel.length} von ${m.kapitelAnzahl} Kapiteln`,
      ende,
      rechte,
    }, path.join(root, `src/downloads/${b.slug}-leseprobe.pdf`), { inhalt });

    // EPUB
    const cover = path.join(tmp, `${b.slug}-cover.png`);
    typst("cover.typ", buchDaten(b), cover, { png: true });
    const text = fs.readFileSync(quelle, "utf8").replace(/<h2 /g, "<h1 ").replace(/<\/h2>/g, "</h1>");
    const motto = m.motto?.length ? `<blockquote class="motto"><p>${m.motto.join("<br/>")}</p></blockquote>\n` : "";
    const html = path.join(tmp, `${b.slug}.html`);
    fs.writeFileSync(html, `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${b.titel}</title></head><body>
${motto}${text}
<section class="ende"><h1>Ende der Leseprobe</h1><p>${ende}</p><p class="rechte">${rechte}</p></section>
</body></html>`);
    execFileSync("pandoc", [
      html,
      "--from=html",
      "--to=epub3",
      `--output=${path.join(root, `src/downloads/${b.slug}-leseprobe.epub`)}`,
      `--epub-cover-image=${cover}`,
      `--css=${path.join(root, "scripts/epub.css")}`,
      "--split-level=1",
      "--toc-depth=1",
      `--metadata=title:${b.titel}`,
      "--metadata=subtitle:Leseprobe",
      `--metadata=author:${site.name}`,
      "--metadata=lang:de-DE",
      `--metadata=rights:© ${jahr} ${site.name}. Alle Rechte vorbehalten.`,
      `--metadata=identifier:urn:matcheque:${b.slug}-leseprobe`,
      `--metadata=date:${jahr}`,
    ], { stdio: "inherit" });
  }

  console.log("· Icons");
  const svg = fs.readFileSync(path.join(root, "src/assets/icons/favicon.svg"), "utf8").replace(/<style>[\s\S]*?<\/style>/, "");
  const icon = (groesse, rand) =>
    Buffer.from(
      svg
        .replace("<path", `<rect width="32" height="32" fill="#fdfdfb"/><path fill="#151515" transform="translate(${rand} ${rand}) scale(${(32 - 2 * rand) / 32})"`)
        .replace('viewBox="0 0 32 32"', `viewBox="0 0 32 32" width="${groesse}" height="${groesse}"`)
    );
  await sharp(icon(180, 4)).png().toFile(path.join(root, "src/assets/icons/apple-touch-icon.png"));
  await sharp(icon(32, 0)).png().toFile(path.join(root, "src/assets/icons/favicon-32.png"));

  console.log("✓ fertig. Danach `npm start` oder `npm run build`.");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
