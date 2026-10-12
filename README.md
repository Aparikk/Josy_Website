# matcheque.de

Autorinnenwebsite von Josie H. Matchèque. Statische Website, gebaut mit [Eleventy](https://www.11ty.dev/) und über GitHub Pages veröffentlicht.

Gestaltung: Richtung „Erster Satz“ auf Papier. Die Startseite zeigt die ersten Sätze der Bücher und wechselnde Zitate. Schrift: Literata (selbst gehostet) mit Kapitälchen. Jedes Buch hat eine eigene Farbe.

Plan bis zum Livegang: [ROADMAP.md](ROADMAP.md).

## Loslegen

```bash
npm install
npm start          # http://localhost:8080, lädt bei Änderungen neu
```

## Wo die Texte stehen

| Was | Datei |
|---|---|
| Name, Unterzeile, Kurzvita, Status, E-Mail | `src/_data/site.yaml` |
| Alles zu einem Buch (Logline, Klappentext, Farbe, Leseprobe, Downloads …) | `src/_data/buecher/<buch>.yaml` |
| Zitate für die wechselnde Galerie | `src/_data/zitate.yaml` |
| Über mich | `src/ueber-mich.njk` (Texte in `site.yaml`) |
| Impressum, Datenschutz, Nutzungsbedingungen, Kolophon | `src/*.md` |

Platzhalter beginnen mit `TODO` und erscheinen auf der Seite gelb markiert. `npm run todo` listet alle offenen Stellen.

Die Vorlage, in die Josie ihre Texte schreibt: [`_texte/website-texte.md`](_texte/website-texte.md).

## Manuskripte, Leseproben, Bilder

Vollständige Manuskripte liegen nur lokal in `manuskripte/` (git-ignoriert) und werden nie veröffentlicht.

```bash
npm run manuskripte   # liest manuskripte/*.epub: Kennzahlen, erster Satz, Text der Leseprobe
npm run assets        # erzeugt Leseprobe-PDF (A5) und -EPUB, Vorschaubilder, Icons
```

`npm run assets` braucht [Typst](https://typst.app/) und [pandoc](https://pandoc.org/): `brew install typst pandoc`.
Die erzeugten Dateien (`src/downloads/`, `src/assets/og/`, `src/assets/icons/`) werden eingecheckt, damit GitHub Actions nur Eleventy ausführen muss.

## Aufbau

```
src/                      Quellen der Website
  _data/                  Texte und Buchdaten (YAML), manuskripte.json (erzeugt)
  _includes/              Layouts, Bausteine, Leseprobentexte (erzeugt)
  assets/                 CSS, Schriften, Bilder, Icons, Vorschaubilder
  downloads/              Leseproben als PDF und EPUB (erzeugt)
scripts/                  manuskripte.mjs, render-assets.mjs, todo.mjs, Typst-Vorlagen, Schriften für PDFs
fotos/                    Originalfotos (nicht veröffentlicht)
_texte/                   Textvorlage für Josie (nicht veröffentlicht)
.github/workflows/        Bauen und Veröffentlichen auf GitHub Pages
```

## Veröffentlichen

Jeder Push auf `main` baut die Website und veröffentlicht sie (GitHub Actions). Voraussetzung: in den Repository-Einstellungen unter Pages ist „GitHub Actions“ als Quelle gewählt.
