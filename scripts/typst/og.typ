// Vorschaubild für geteilte Links (1200 × 630 Pixel bei 72 ppi).
#import "titelblatt.typ": titelblatt
#let daten = json("daten.json")
#let papier = rgb("#f3eee3")
#let tinte = rgb("#231d18")
#let bleistift = rgb("#6a6056")
#let linie = rgb("#cbbfa8")
#set page(width: 1200pt, height: 630pt, margin: 0pt, fill: papier)
#set text(fill: tinte, lang: "de", region: "DE", font: "Literata Text")
#set par(justify: false, first-line-indent: 0pt)
#let kap(s, groesse) = text(size: groesse, tracking: 0.08em, smallcaps(lower(s)))

#if daten.art == "buch" {
  grid(
    columns: (420pt, 1fr),
    titelblatt(daten, 420pt),
    block(width: 100%, height: 630pt, inset: (x: 64pt, top: 52pt, bottom: 48pt), grid(
      rows: (auto, 1fr, auto),
      kap(daten.autorin, 26pt),
      align(horizon, block(height: 400pt, clip: true, align(horizon, {
        let groesse = if daten.satz.len() > 220 { 31pt } else if daten.satz.len() > 120 { 36pt } else { 44pt }
        set par(leading: 0.3em)
        text(font: "Literata Display", weight: 300, size: groesse, hyphenate: false, daten.satz)
      }))),
      block(width: 100%, stroke: (top: 1.5pt + linie), inset: (top: 18pt), text(fill: bleistift, grid(columns: (1fr, auto), text(size: 22pt, style: "italic", daten.titel) + text(size: 22pt, " · ") + kap(daten.gattung, 22pt), kap(daten.url, 22pt)))),
    )),
  )
} else {
  grid(
    columns: (1fr, 520pt),
    block(width: 100%, height: 630pt, inset: 64pt, grid(
      rows: (1fr, auto),
      align(bottom, {
        kap(daten.autorin, 30pt)
        v(14pt)
        text(font: "Literata Display", style: "italic", size: 62pt, hyphenate: false, "Was geschrieben werden muss")
      }),
      pad(top: 36pt, text(fill: bleistift, kap(daten.url, 22pt))),
    )),
    block(width: 100%, height: 630pt, inset: (right: 64pt, y: 64pt), align(horizon, grid(
      columns: (1fr,) * daten.buecher.len(),
      column-gutter: 16pt,
      ..daten.buecher.map(b => titelblatt(b, (456pt - 16pt * (daten.buecher.len() - 1)) / daten.buecher.len())),
    ))),
  )
}
