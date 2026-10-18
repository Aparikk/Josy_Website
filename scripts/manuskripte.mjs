// Liest die vollständigen Manuskripte aus manuskripte/ (git-ignoriert) und erzeugt daraus
// alles, was die Website braucht, ohne dass ein vollständiges Manuskript ins Repo gelangt:
//   src/_data/manuskripte.json        Kennzahlen, erster Satz, erster Absatz, Motto
//   src/_includes/leseproben/<slug>.html   Text der Leseprobe (nur die ersten Kapitel)
//
// Aufruf: npm run manuskripte

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const root = path.resolve(import.meta.dirname, "..");
const buecherDir = path.join(root, "src/_data/buecher");
const manuskripteDir = path.join(root, "manuskripte");
const datenDatei = path.join(root, "src/_data/manuskripte.json");
const leseprobenDir = path.join(root, "src/_includes/leseproben");

const ZEICHEN_PRO_NORMSEITE = 1800;
const ABKUERZUNGEN = ["z. B.", "d. h.", "u. a.", "o. Ä.", "bzw.", "ca.", "Dr.", "Nr.", "St.", "usw.", "vgl.", "evtl.", "Hr.", "Fr."];

const unzipListe = (datei) => execFileSync("unzip", ["-Z1", datei], { encoding: "utf8" }).split("\n").filter(Boolean);
const unzipLesen = (datei, eintrag) =>
  execFileSync("unzip", ["-p", datei, eintrag], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return entities[e] ?? m;
  });
const reinerText = (html) => decode(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

// Nur Auszeichnungen behalten, die zum Text gehören (kursiv, fett, Zeilenumbruch).
function inlineBereinigen(html) {
  return html
    .replace(/<a\b[^>]*\/>/g, "")
    .replace(/<\/?(?!em\b|strong\b|br\b)[a-z][^>]*>/gi, "")
    .replace(/<(em|strong)\b[^>]*>/gi, "<$1>")
    .replace(/<br\s*\/?>/gi, "<br>")
    .replace(/<(em|strong)>\s*<\/\1>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function spineDateien(epub) {
  const container = unzipLesen(epub, "META-INF/container.xml");
  const opfPfad = container.match(/full-path="([^"]+)"/)[1];
  const opf = unzipLesen(epub, opfPfad);
  const basis = path.posix.dirname(opfPfad);
  const manifest = Object.fromEntries([...opf.matchAll(/<item\b[^>]*\bid="([^"]+)"[^>]*\bhref="([^"]+)"/g)].map((m) => [m[1], m[2]]));
  return [...opf.matchAll(/<itemref\b([^>]*)\/?>/g)]
    .filter((m) => !/linear="no"/.test(m[1]))
    .map((m) => m[1].match(/idref="([^"]+)"/)[1])
    .map((id) => path.posix.join(basis, manifest[id]));
}

function bloecke(xhtml) {
  const body = xhtml.replace(/^[\s\S]*?<body[^>]*>/, "").replace(/<\/body>[\s\S]*$/, "");
  return [...body.matchAll(/<(h[1-6]|p)\b([^>]*)>([\s\S]*?)<\/\1>/g)].map((m) => ({
    tag: m[1],
    klasse: (m[2].match(/class="([^"]*)"/) || [])[1] || "",
    html: m[3],
    text: reinerText(m[3]),
    kapitelAnfang: /id="navid\d+"/.test(m[3]),
  }));
}

function ersterSatz(text) {
  const re = /[.!?…][»«“”"’‘']*(?=\s+[„"»‚A-ZÄÖÜ0-9])/g;
  let m;
  while ((m = re.exec(text))) {
    const bis = m.index + m[0].length;
    const davor = text.slice(0, bis);
    if (ABKUERZUNGEN.some((a) => davor.endsWith(a))) continue;
    return davor.trim();
  }
  return text.trim();
}

function lesen(epub) {
  const dateien = spineDateien(epub);
  const alle = dateien.flatMap((d, i) => bloecke(unzipLesen(epub, d)).map((b) => ({ ...b, datei: i })));

  const woerterPapyrus = Number((alle.find((b) => /^Wortzähler:/.test(b.text))?.text.match(/\d+/) || [])[0]) || null;

  // Titelei: Untertitel steht bei Papyrus als erste zentrierte Zeile nach der h1 (nicht „von“).
  const h1 = alle.findIndex((b) => b.tag === "h1");
  let untertitel = "";
  if (h1 >= 0) {
    const naechste = alle.slice(h1 + 1).find((b) => b.text);
    if (naechste && naechste.text !== "von") untertitel = naechste.text;
  }

  // Kapitel beginnen an den Ankern aus dem Inhaltsverzeichnis. Leere Anker ohne Titel sind keine Kapitel.
  // Ein „Kapitel“ ohne eigenen Text ist ein Teil (z. B. „Astra Mala“ in Alma Mater) und wird dem nächsten Kapitel vorangestellt.
  let kapitel = [];
  const vorspann = [];
  let aktuell = null;
  for (const b of alle) {
    if (b.kapitelAnfang && b.text) {
      aktuell = { titel: b.text, absaetze: [] };
      kapitel.push(aktuell);
      continue;
    }
    if (b.kapitelAnfang) continue;
    if (!aktuell) {
      vorspann.push(b);
      continue;
    }
    if (!b.text) {
      if (aktuell.absaetze.length) aktuell.szenenwechsel = true;
      continue;
    }
    // Kurze zentrierte Zeile direkt nach dem Titel: Untertitel des Kapitels
    if (!aktuell.absaetze.length && !aktuell.untertitel && /center/.test(b.klasse) && b.text.length < 90) {
      aktuell.untertitel = b.text;
      continue;
    }
    aktuell.absaetze.push({ html: inlineBereinigen(b.html), text: b.text, ohneEinzug: /noindent/.test(b.klasse), nachWechsel: !!aktuell.szenenwechsel });
    aktuell.szenenwechsel = false;
  }
  // Kapitel nach einem Teil gehören zu diesem Teil, bis der nächste Teil beginnt.
  // k.teilBeginn: dieses Kapitel eröffnet den Teil (dort steht die Teil-Überschrift).
  let teil = null;
  let neuerTeil = false;
  kapitel = kapitel.filter((k) => {
    if (!k.absaetze.length) {
      teil = k.titel;
      neuerTeil = true;
      return false;
    }
    if (teil) {
      k.teil = teil;
      k.teilBeginn = neuerTeil;
      neuerTeil = false;
    }
    return true;
  });

  // Motto: Text zwischen Titelei und erstem Kapitel, der nicht zur Titelseite gehört.
  const titelDatei = h1 >= 0 ? alle[h1].datei : -1;
  const motto = vorspann.filter((b) => b.datei > titelDatei && b.text).map((b) => b.text);

  const zeichen = (ks) => ks.reduce((n, k) => n + k.absaetze.reduce((m, a) => m + a.text.length + 1, 0), 0);
  const woerter = (ks) => ks.reduce((n, k) => n + k.absaetze.reduce((m, a) => m + a.text.split(" ").length, 0), 0);
  return { woerterPapyrus, untertitel, motto, kapitel, zeichen, woerter };
}

function leseprobeHtml(kapitel) {
  // Bücher ohne Teile: Kapitel = h2.
  // Bücher mit Teilen (Alma Mater): oberste Ebene (h2) sind die Teile und Kapitel, die zu keinem Teil gehören
  // (etwa der Prolog); Kapitel innerhalb eines Teils stehen eine Ebene darunter (h3).
  const mitTeilen = kapitel.some((k) => k.teil);
  return kapitel
    .map((k, i) => {
      const n = i + 1;
      const absaetze = k.absaetze
        .map((a, j) => {
          const hr = a.nachWechsel ? '<hr class="szenenwechsel">\n' : "";
          const klasse = j === 0 || a.nachWechsel || a.ohneEinzug ? ' class="ohne-einzug"' : "";
          return `${hr}<p${klasse}>${a.html}</p>`;
        })
        .join("\n");
      const teil = k.teilBeginn ? `<h2 class="teil" id="teil-${n}">${k.teil}</h2>\n` : "";
      const oben = mitTeilen && !k.teil;
      const h = !mitTeilen || oben ? "h2" : "h3";
      const titelKlasse = oben ? "teil" : "kapitel-titel";
      const untertitel = k.untertitel ? `\n<p class="kapitel-untertitel">${k.untertitel}</p>` : "";
      return `${teil}<section class="kapitel${oben ? " kapitel--oben" : ""}" id="kapitel-${n}" aria-labelledby="kapitel-${n}-titel">\n<${h} class="${titelKlasse}" id="kapitel-${n}-titel">${k.titel}</${h}>${untertitel}\n${absaetze}\n</section>`;
    })
    .join("\n\n");
}

// Inhaltsverzeichnis für die Leseansicht: Teile mit ihren Kapiteln darunter.
function inhalt(kapitel) {
  const liste = [];
  kapitel.forEach((k, i) => {
    const eintrag = { titel: k.titel, anker: `kapitel-${i + 1}` };
    if (!k.teil) return liste.push(eintrag);
    if (k.teilBeginn) liste.push({ titel: k.teil, anker: `teil-${i + 1}`, kapitel: [] });
    liste[liste.length - 1].kapitel.push(eintrag);
  });
  return liste;
}

const daten = {};
fs.mkdirSync(leseprobenDir, { recursive: true });

for (const datei of fs.readdirSync(buecherDir).filter((f) => f.endsWith(".yaml")).sort()) {
  const buch = yaml.load(fs.readFileSync(path.join(buecherDir, datei), "utf8"));
  const slug = buch.slug;
  if (!buch.manuskript) {
    console.log(`– ${slug}: kein Manuskript hinterlegt, übersprungen`);
    continue;
  }
  const epub = path.join(manuskripteDir, buch.manuskript);
  if (!fs.existsSync(epub)) {
    console.warn(`! ${slug}: ${path.relative(root, epub)} fehlt, übersprungen`);
    continue;
  }

  const m = lesen(epub);
  const gewuenscht = buch.lesen?.kapitel ?? 3;
  const anzahl = gewuenscht === "alle" ? m.kapitel.length : Math.min(gewuenscht, m.kapitel.length);
  const probe = m.kapitel.slice(0, anzahl);
  const erster = m.kapitel[0].absaetze[0];

  daten[slug] = {
    woerter: m.woerterPapyrus ?? m.woerter(m.kapitel),
    woerterQuelle: m.woerterPapyrus ? "Papyrus" : "gezählt",
    zeichen: m.zeichen(m.kapitel),
    normseitenGeschaetzt: Math.round(m.zeichen(m.kapitel) / ZEICHEN_PRO_NORMSEITE),
    kapitelAnzahl: m.kapitel.length,
    untertitel: m.untertitel,
    motto: m.motto,
    ersterSatz: ersterSatz(erster.text),
    ersterAbsatz: erster.html,
    leseprobe: {
      vollstaendig: buch.lesen?.umfang === "vollstaendig",
      mitTeilen: probe.some((k) => k.teil),
      kapitel: probe.map((k) => k.titel),
      inhalt: inhalt(probe),
      woerter: m.woerter(probe),
      normseiten: Math.round(m.zeichen(probe) / ZEICHEN_PRO_NORMSEITE),
    },
  };

  fs.writeFileSync(path.join(leseprobenDir, `${slug}.html`), leseprobeHtml(probe) + "\n");
  const d = daten[slug];
  console.log(`✓ ${slug}: ${d.woerter} Wörter, ≈ ${d.normseitenGeschaetzt} NS, ${d.kapitelAnzahl} Kapitel; Leseprobe ${anzahl} Kapitel ≈ ${d.leseprobe.normseiten} NS`);
  console.log(`  Erster Satz: ${d.ersterSatz}`);
}

fs.writeFileSync(datenDatei, JSON.stringify(daten, null, 2) + "\n");
console.log(`→ ${path.relative(root, datenDatei)}`);
