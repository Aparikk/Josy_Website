(function () {
  "use strict";

  var storageKey = "josy-style-study";
  var themes = {
    original: "Aktuell",
    darker: "Darker Academia",
    darkest: "Darkest Academia"
  };

  function isTheme(value) {
    return Object.prototype.hasOwnProperty.call(themes, value);
  }

  function storedTheme() {
    try {
      var value = window.localStorage.getItem(storageKey);
      return isTheme(value) ? value : "original";
    } catch (error) {
      return "original";
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-site-theme", isTheme(theme) ? theme : "original");
  }

  var initialTheme = storedTheme();
  applyTheme(initialTheme);

  function updateControls(theme, announce) {
    document.querySelectorAll("[data-theme-choice]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-theme-choice") === theme));
    });

    if (announce) {
      var status = document.querySelector("[data-theme-status]");
      if (status) {
        status.textContent = "Darstellung „" + themes[theme] + "“ ausgewählt.";
      }
    }
  }

  function chooseTheme(theme) {
    if (!isTheme(theme)) {
      return;
    }

    applyTheme(theme);
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
      /* The selector still works when browser storage is unavailable. */
    }
    updateControls(theme, true);
  }

  function addSelector() {
    var footer = document.querySelector(".site-footer");
    if (!footer || footer.querySelector(".theme-lab")) {
      return;
    }

    var container = document.createElement("div");
    container.className = "container-xl px-4";
    container.innerHTML =
      '<div class="theme-lab">' +
        '<div class="theme-lab-copy">' +
          '<span class="theme-lab-kicker">Stiltest</span>' +
          '<span class="theme-lab-note">Darstellung wählen</span>' +
        '</div>' +
        '<div class="theme-options" role="group" aria-label="Darstellung auswählen">' +
          '<button class="theme-choice" type="button" data-theme-choice="original" aria-pressed="false">Aktuell</button>' +
          '<button class="theme-choice" type="button" data-theme-choice="darker" aria-pressed="false">Darker Academia</button>' +
          '<button class="theme-choice" type="button" data-theme-choice="darkest" aria-pressed="false">Darkest Academia</button>' +
        '</div>' +
        '<span class="visually-hidden" data-theme-status aria-live="polite"></span>' +
      '</div>';

    footer.insertBefore(container, footer.firstChild);
    if (container.nextElementSibling) {
      container.nextElementSibling.classList.add("pt-4");
    }
  }

  function initialiseSelector() {
    addSelector();
    updateControls(document.documentElement.getAttribute("data-site-theme") || "original", false);

    document.querySelectorAll("[data-theme-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        chooseTheme(button.getAttribute("data-theme-choice"));
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseSelector, { once: true });
  } else {
    initialiseSelector();
  }
})();
