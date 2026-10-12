// Sendet das Kontaktformular direkt an Formspree, ohne die Seite zu verlassen.
// Ohne JavaScript funktioniert das Formular trotzdem (normale Übermittlung).
const formular = document.getElementById("kontaktformular");
const status = formular?.querySelector(".formular-status");

const meldungen = {
  name: "Bitte gib deinen Namen an.",
  email: "Bitte gib eine gültige E-Mail-Adresse an.",
  nachricht: "Die Nachricht braucht mindestens 10 Zeichen.",
};

function pruefen() {
  let ersterFehler = null;
  for (const feld of formular.querySelectorAll("input[required], textarea[required]")) {
    const fehler = !feld.checkValidity();
    feld.setAttribute("aria-invalid", fehler ? "true" : "false");
    let hinweis = feld.parentElement.querySelector(".feld-fehler");
    if (fehler) {
      if (!hinweis) {
        hinweis = document.createElement("p");
        hinweis.className = "feld-fehler";
        hinweis.id = `${feld.id}-fehler`;
        feld.parentElement.append(hinweis);
        feld.setAttribute("aria-errormessage", hinweis.id);
      }
      hinweis.textContent = meldungen[feld.name];
      ersterFehler ??= feld;
    } else {
      hinweis?.remove();
    }
  }
  ersterFehler?.focus();
  return !ersterFehler;
}

formular?.addEventListener("submit", async (ereignis) => {
  ereignis.preventDefault();
  if (!pruefen()) return;
  const knopf = formular.querySelector("button[type=submit]");
  knopf.disabled = true;
  status.textContent = "Wird gesendet …";
  status.dataset.zustand = "";
  try {
    const antwort = await fetch(formular.action, {
      method: "POST",
      body: new FormData(formular),
      headers: { Accept: "application/json" },
    });
    if (!antwort.ok) throw new Error(String(antwort.status));
    formular.reset();
    status.textContent = "Danke, die Nachricht ist angekommen.";
    status.dataset.zustand = "ok";
  } catch {
    status.textContent = `Das hat nicht geklappt. Bitte versuch es noch einmal oder schreib direkt an ${formular.dataset.email || "kontakt@matcheque.de"}.`;
    status.dataset.zustand = "fehler";
  } finally {
    knopf.disabled = false;
  }
});
