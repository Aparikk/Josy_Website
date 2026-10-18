// Wechselnde Zitate in zufälliger Reihenfolge, bei jedem Besuch neu gemischt.
// Mischen nach Fisher–Yates (gleichverteilt), danach so umsortiert, dass möglichst nie zwei Zitate
// aus demselben Buch (auf Buchseiten: von derselben Figur) direkt aufeinander folgen.
// Die Zeitleiste unter dem Zitat ist die Uhr: Ist sie voll, kommt das nächste.
// Mit der Maus oder dem Tastaturfokus im Bereich hält sie an.
// Ohne JavaScript stehen alle Zitate untereinander. Bei „Bewegung reduzieren“ wechselt nichts von allein.
const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;

function mischen(liste) {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Gleiche Schlüssel auseinanderziehen: an jeder Stelle das erste Element nehmen, das sich vom Vorgänger unterscheidet.
function verteilen(liste, schluessel) {
  const rest = [...liste];
  const ergebnis = [];
  while (rest.length) {
    const vorher = ergebnis.length ? schluessel(ergebnis[ergebnis.length - 1]) : null;
    let i = rest.findIndex((e) => schluessel(e) !== vorher);
    if (i < 0) i = 0;
    ergebnis.push(rest.splice(i, 1)[0]);
  }
  return ergebnis;
}

for (const bereich of document.querySelectorAll("[data-zitate]")) {
  const eintraege = [...bereich.querySelectorAll(".zitate-liste > li")];
  if (eintraege.length < 2) continue;

  const mehrereBuecher = new Set(eintraege.map((e) => e.dataset.buch)).size > 1;
  const schluessel = mehrereBuecher ? (e) => e.dataset.buch : (e) => e.dataset.wer || Math.random();
  const reihenfolge = verteilen(mischen(eintraege), schluessel);

  const zaehler = bereich.querySelector(".zitate-zaehler");
  const uhr = bereich.querySelector(".zitate-uhr");
  const pause = bereich.querySelector("[data-pause]");
  let stelle = -1;
  let angehalten = ruhig;

  function zeigen(neu) {
    const vorher = reihenfolge[stelle];
    stelle = (neu + reihenfolge.length) % reihenfolge.length;
    const jetzt = reihenfolge[stelle];
    for (const e of eintraege) {
      e.classList.toggle("aktiv", e === jetzt);
      e.classList.toggle("weg", e === vorher && e !== jetzt);
      e.setAttribute("aria-hidden", String(e !== jetzt));
    }
    zaehler.textContent = `${stelle + 1} von ${reihenfolge.length}`;
    // Zeitleiste neu starten
    bereich.classList.remove("laeuft");
    void uhr.offsetWidth;
    if (!angehalten) bereich.classList.add("laeuft");
  }
  function setzePause(wert) {
    angehalten = wert;
    pause.setAttribute("aria-pressed", String(wert));
    pause.textContent = wert ? "abspielen" : "anhalten";
    bereich.classList.toggle("laeuft", !wert);
  }

  uhr.addEventListener("animationend", () => zeigen(stelle + 1));
  bereich.querySelector("[data-weiter]").addEventListener("click", () => zeigen(stelle + 1));
  bereich.querySelector("[data-zurueck]").addEventListener("click", () => zeigen(stelle - 1));
  pause.addEventListener("click", () => setzePause(!angehalten));
  const warten = (an) => bereich.classList.toggle("wartet", an);
  bereich.addEventListener("mouseenter", () => warten(true));
  bereich.addEventListener("mouseleave", () => warten(false));
  bereich.addEventListener("focusin", () => warten(true));
  bereich.addEventListener("focusout", () => warten(false));

  bereich.classList.add("bereit");
  setzePause(angehalten);
  zeigen(0);
}
