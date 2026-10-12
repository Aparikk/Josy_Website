// Listet alle Platzhalter ("TODO"), die vor dem Livegang durch echten Text ersetzt werden müssen.
// Aufruf: npm run todo   (Exit-Code 1, solange noch etwas offen ist)

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const endungen = new Set([".yaml", ".md", ".njk", ".html"]);
const funde = [];

function durchsuchen(ordner) {
  for (const eintrag of fs.readdirSync(ordner, { withFileTypes: true })) {
    const pfad = path.join(ordner, eintrag.name);
    if (eintrag.isDirectory()) {
      if (eintrag.name !== "render") durchsuchen(pfad);
    } else if (endungen.has(path.extname(eintrag.name))) {
      fs.readFileSync(pfad, "utf8").split("\n").forEach((zeile, i) => {
        if (/TODO/.test(zeile) && !/^\s*#/.test(zeile)) funde.push(`${path.relative(root, pfad)}:${i + 1}  ${zeile.trim()}`);
      });
    }
  }
}

durchsuchen(path.join(root, "src"));
if (funde.length) {
  console.log(`${funde.length} offene Platzhalter:\n`);
  console.log(funde.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Keine Platzhalter mehr. Bereit für den Livegang.");
}
