// Leseprobe als A5-Buch. Kennzahlen und Texte aus daten.json, der Romantext aus inhalt.typ (von pandoc).
#let daten = json("daten.json")
#let buchfarbe = rgb(daten.farbe.hell)
#let grau = luma(85)

#set document(title: daten.titel + " · Leseprobe", author: daten.autorin)
#set page(
  paper: "a5",
  margin: (inside: 17mm, outside: 15mm, top: 18mm, bottom: 20mm),
  footer: context {
    let n = counter(page).get().first()
    align(center, text(font: "Literata Text", size: 8.5pt, fill: grau, number-type: "old-style", str(n)))
  },
)
#set text(font: "Literata Text", size: 10pt, lang: "de", region: "DE", hyphenate: true, number-type: "old-style", fill: luma(12))
#set par(justify: true, leading: 0.64em, spacing: 0.64em, first-line-indent: 1.2em)
// Kapitel beginnen auf einer neuen Seite. Als Block gesetzt, damit der erste Absatz danach ohne Einzug beginnt.
#show heading.where(level: 2): it => {
  pagebreak(weak: true)
  block(width: 100%, above: 24mm, below: 11mm, align(center, text(font: "Literata Display", style: "italic", weight: 400, size: 13pt, it.body)))
}
#let horizontalrule = align(center, block(above: 1.1em, below: 1.1em, text(fill: grau, "⁂")))

// Titelseite
#page(footer: none, {
  set par(justify: false, first-line-indent: 0pt)
  align(center, {
    v(1fr)
    text(font: "Literata Display", style: "italic", size: 12pt, daten.autorin)
    v(14mm)
    text(font: "Literata Display", weight: 300, size: 30pt, hyphenate: false, daten.titel)
    if daten.untertitel != "" {
      v(5mm)
      text(font: "Literata Display", style: "italic", size: 12pt, daten.untertitel)
    }
    v(9mm)
    box(width: 16mm, height: 1.2pt, fill: rgb(daten.farbe.akzent))
    v(9mm)
    text(font: "Schibsted Grotesk", weight: 600, size: 8pt, tracking: 0.14em, fill: buchfarbe, upper("Leseprobe"))
    v(2.5mm)
    text(font: "Schibsted Grotesk", size: 8pt, fill: grau, daten.angabe)
    v(1fr)
    text(font: "Schibsted Grotesk", size: 8pt, fill: grau, daten.url)
  })
})

// Motto
#if daten.motto.len() > 0 {
  page(footer: none, {
    set par(justify: false, first-line-indent: 0pt)
    v(1fr)
    align(center, text(style: "italic", daten.motto.join("\n")))
    v(2fr)
  })
}

#include "inhalt.typ"

// Ende
#pagebreak()
#{
  set par(justify: false, first-line-indent: 0pt)
  v(1fr)
  align(center, {
    text(fill: buchfarbe, size: 14pt, "⁂")
    v(7mm)
    text(font: "Literata Display", style: "italic", size: 13pt, "Ende der Leseprobe")
    v(7mm)
    block(width: 85%, daten.ende)
    v(12mm)
    block(width: 85%, text(font: "Schibsted Grotesk", size: 7.5pt, fill: grau, daten.rechte))
  })
  v(1fr)
}
