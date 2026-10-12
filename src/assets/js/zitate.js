// Wechselnde Zitate: zeigt eines nach dem anderen, in zufälliger Reihenfolge.
// Ohne JavaScript stehen alle Zitate untereinander. Bei „Bewegung reduzieren“ wechselt nichts von allein.
const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;

for (const bereich of document.querySelectorAll("[data-zitate]")) {
  const eintraege = [...bereich.querySelectorAll(".zitate-liste > li")];
  if (eintraege.length < 2) continue;

  const reihenfolge = eintraege.map((_, i) => i).sort(() => Math.random() - 0.5);
  const zaehler = bereich.querySelector(".zitate-zaehler");
  const pause = bereich.querySelector("[data-pause]");
  let stelle = 0;
  let angehalten = ruhig;
  let uhr = null;

  function zeigen(neu) {
    stelle = (neu + reihenfolge.length) % reihenfolge.length;
    eintraege.forEach((e, i) => (e.hidden = i !== reihenfolge[stelle]));
    zaehler.textContent = `${stelle + 1} von ${reihenfolge.length}`;
  }
  function planen() {
    clearInterval(uhr);
    if (!angehalten) uhr = setInterval(() => zeigen(stelle + 1), 9000);
  }
  function setzePause(wert) {
    angehalten = wert;
    pause.setAttribute("aria-pressed", String(wert));
    pause.textContent = wert ? "abspielen" : "anhalten";
    planen();
  }

  bereich.querySelector("[data-weiter]").addEventListener("click", () => { zeigen(stelle + 1); planen(); });
  bereich.querySelector("[data-zurueck]").addEventListener("click", () => { zeigen(stelle - 1); planen(); });
  pause.addEventListener("click", () => setzePause(!angehalten));
  bereich.addEventListener("mouseenter", () => clearInterval(uhr));
  bereich.addEventListener("mouseleave", planen);
  bereich.addEventListener("focusin", () => clearInterval(uhr));
  bereich.addEventListener("focusout", planen);

  bereich.classList.add("bereit");
  zeigen(0);
  setzePause(angehalten);
}
