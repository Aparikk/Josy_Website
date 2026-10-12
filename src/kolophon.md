---
layout: layouts/recht.njk
titel: Kolophon
beschreibung: "Wie diese Website gemacht ist: Schriften, Fotos, Technik."
---

## Schriften

Gesetzt aus der **Literata** von TypeTogether und der **Schibsted Grotesk** von Bakken & Bæck, beide unter der SIL Open Font License. Die Schriften werden von dieser Website selbst ausgeliefert.

## Fotos

{% if site.fotografie | istTodo %}{{ site.fotografie }}{% else %}Porträt: {{ site.fotografie }}{% endif %}

## Texte

Alle Texte und Auszüge © {{ jahr }} {{ site.name }}. Die ersten Sätze auf der Startseite stammen aus den Manuskripten.

## Technik

Gebaut mit Eleventy, veröffentlicht über GitHub Pages. Keine Cookies, keine Reichweitenmessung, keine Inhalte von Drittanbietern.
