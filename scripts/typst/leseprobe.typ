// Lesefassung als A5-Buch. Kennzahlen und Texte aus daten.json, der Romantext aus inhalt.typ (von pandoc).
#let daten = json("daten.json")
#let buchfarbe = rgb(daten.farbe.hell)
#let grau = luma(85)
#let kap(s, groesse: 8.5pt) = text(size: groesse, tracking: 0.08em, smallcaps(lower(s)))

#set document(title: daten.titel + (if daten.art != "" { " · " + daten.art } else { "" }), author: daten.autorin)
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

// Kapitel (und bei Büchern mit Teilen: Teile) beginnen auf einer neuen Seite.
// Als Block gesetzt, damit der erste Absatz danach ohne Einzug beginnt.
#let kapiteltitel(it) = {
  pagebreak(weak: true)
  block(width: 100%, above: 24mm, below: 11mm, align(center, text(font: "Literata Display", style: "italic", weight: 400, size: 13pt, it.body)))
}
#show heading.where(level: 2): it => {
  if daten.mitTeilen {
    pagebreak(weak: true)
    block(width: 100%, above: 50mm, below: 0mm, align(center, {
      text(fill: grau, "⁂")
      v(6mm)
      text(font: "Literata Display", style: "italic", weight: 400, size: 22pt, it.body)
    }))
  } else { kapiteltitel(it) }
}
#show heading.where(level: 3): kapiteltitel

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
    if daten.art != "" { text(fill: buchfarbe, kap(daten.art, groesse: 10pt)); v(2mm) }
    text(fill: grau, kap(daten.angabe))
    v(1fr)
    text(fill: grau, kap(daten.url))
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
    text(font: "Literata Display", style: "italic", size: 13pt, if daten.art != "" { "Ende der " + daten.art } else { "Ende" })
    if daten.ende != "" {
      v(7mm)
      block(width: 85%, daten.ende)
    }
    v(12mm)
    block(width: 85%, text(size: 7.5pt, fill: grau, daten.rechte))
  })
  v(1fr)
}
