// Kopier-Knöpfe: erscheinen nur, wenn der Browser in die Zwischenablage schreiben kann.
for (const knopf of document.querySelectorAll("[data-kopieren]")) {
  if (!navigator.clipboard) continue;
  knopf.hidden = false;
  const beschriftung = knopf.textContent;
  knopf.addEventListener("click", async () => {
    const quelle = document.getElementById(knopf.dataset.kopieren);
    try {
      await navigator.clipboard.writeText(quelle.innerText.trim());
      knopf.textContent = "Kopiert";
    } catch {
      getSelection().selectAllChildren(quelle);
      knopf.textContent = "Markiert, bitte mit ⌘C oder Strg+C kopieren";
    }
    setTimeout(() => (knopf.textContent = beschriftung), 2500);
  });
}
