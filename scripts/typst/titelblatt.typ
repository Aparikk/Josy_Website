// Das typografische Titelblatt, gleich aufgebaut wie .titelblatt im CSS der Website.
// Alle Maße sind relativ zur Breite, damit es als Cover (1600 pt) und im Vorschaubild (420 pt) gleich aussieht.
#let titelblatt(daten, breite) = {
  let e = breite / 100
  let hell = rgb("#f6f1e6")
  block(width: breite, height: breite * 1.5, fill: rgb(daten.farbe.hell), inset: (x: 9 * e, top: 9 * e, bottom: 8 * e), {
    set text(fill: hell, lang: "de", hyphenate: false)
    set par(justify: false, first-line-indent: 0pt, leading: 0.12em)
    grid(
      rows: (auto, 1fr, auto),
      text(font: "Literata Display", style: "italic", size: 6.4 * e, fill: hell.transparentize(8%), daten.autorin),
      align(horizon, {
        text(font: "Literata Display", weight: 300, size: 13 * e, daten.titel)
        v(6 * e)
        box(width: 18 * e, height: calc.max(0.8 * e, 1.5pt), fill: rgb(daten.farbe.akzent))
      }),
      text(font: "Literata Text", size: 5.6 * e, tracking: 0.14em, fill: hell.transparentize(12%), smallcaps(lower(daten.at("zeile", default: daten.gattung)))),
    )
  })
}
