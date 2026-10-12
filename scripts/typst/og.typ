// Vorschaubild für geteilte Links (1200 × 630 Pixel bei 72 ppi).
#import "titelblatt.typ": titelblatt
#let daten = json("daten.json")
#let papier = rgb("#fdfdfb")
#let tinte = rgb("#151515")
#let bleistift = rgb("#5f5f5c")
#set page(width: 1200pt, height: 630pt, margin: 0pt, fill: papier)
#set text(fill: tinte, lang: "de", region: "DE")
#set par(justify: false, first-line-indent: 0pt)

#if daten.art == "buch" {
  grid(
    columns: (420pt, 1fr),
    titelblatt(daten, 420pt),
    block(width: 100%, height: 630pt, inset: (x: 64pt, top: 56pt, bottom: 52pt), grid(
      rows: (auto, 1fr, auto),
      text(font: "Schibsted Grotesk", weight: 600, size: 24pt, daten.autorin),
      align(horizon, block(height: 400pt, clip: true, align(horizon, {
        let groesse = if daten.satz.len() > 220 { 31pt } else if daten.satz.len() > 120 { 36pt } else { 44pt }
        set par(leading: 0.3em)
        text(font: "Literata Display", weight: 300, size: groesse, hyphenate: false, daten.satz)
      }))),
      text(font: "Schibsted Grotesk", size: 21pt, fill: bleistift, grid(columns: (1fr, auto), daten.titel + " · " + daten.gattung, daten.url)),
    )),
  )
} else {
  grid(
    columns: (1fr, 520pt),
    block(width: 100%, height: 630pt, inset: 64pt, grid(
      rows: (1fr, auto),
      align(bottom, {
        text(font: "Literata Display", weight: 300, size: 80pt, hyphenate: false, daten.autorin)
        v(18pt)
        text(font: "Schibsted Grotesk", size: 30pt, fill: bleistift, daten.unterzeile)
      }),
      pad(top: 40pt, text(font: "Schibsted Grotesk", size: 21pt, fill: bleistift, daten.url)),
    )),
    block(width: 100%, height: 630pt, inset: (right: 64pt, y: 64pt), align(horizon, grid(
      columns: (1fr,) * daten.buecher.len(),
      column-gutter: 16pt,
      ..daten.buecher.map(b => titelblatt(b, (456pt - 16pt * (daten.buecher.len() - 1)) / daten.buecher.len())),
    ))),
  )
}
