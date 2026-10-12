---
layout: layouts/basis.njk
titel: Über mich
beschreibung: "Über Josie H Matchèque: Kurzvita, Werdegang und Stationen."
---
<div class="seite ueber">
  <header class="seiten-kopf">
    <h1 class="seiten-titel">Über mich</h1>
  </header>
  <div class="ueber-raster">
    <figure class="ueber-bild">
      <img src="/assets/img/portrait-hoch.jpg" alt="Porträt von {{ site.name }}" sizes="(min-width: 56em) 22rem, 90vw" loading="eager" fetchpriority="high">
      <figcaption>{% if site.fotografie | istTodo %}{{ site.fotografie }}{% else %}Foto: {{ site.fotografie }}{% endif %}</figcaption>
    </figure>
    <div class="fliesstext ueber-text">

{{ site.kurzvita | md | safe }}

<!-- Ausführliche Vita (Vorlage Abschnitt 4), 150 bis 300 Wörter. Einfach hier als Absätze schreiben. -->

TODO: Ausführliche Vita, 150 bis 300 Wörter (Abschnitt 4)

## Stationen

<!-- Eine Zeile pro Station: Jahr, dann was. Leere Liste = Abschnitt löschen. -->

- TODO: Jahr · Veröffentlichung, Preis, Stipendium, Lesung, Studium … (Abschnitt 4)

</div>
  </div>
</div>
