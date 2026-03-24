console.log("APP V3.2 CHARGEE");
import { state } from "./state.js";
import { loadStateFromStorage } from "./storage.js";
import { renderPlanning, changeDay } from "./features/planning.js";

document.addEventListener("DOMContentLoaded", () => {
  loadStateFromStorage();

  if (state.theme === "dark") {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }

  const planningView = document.getElementById("view-etapes");
  const budgetView = document.getElementById("view-budget");
  const vaultView = document.getElementById("view-vault");
  const navItems = document.querySelectorAll(".nav-item");

  function openView(targetId) {
    [planningView, budgetView, vaultView].forEach((view) => {
      view?.classList.remove("is-visible");
    });

    navItems.forEach((item) => item.classList.remove("active"));

    if (targetId !== "none") {
      const target = document.getElementById(targetId);
      if (target) target.classList.add("is-visible");
    }

    const activeTab = document.querySelector(`.nav-item[data-target="${targetId}"]`);
    if (activeTab) activeTab.classList.add("active");
  }

  document.getElementById("tab-planning")?.addEventListener("click", () => openView("view-etapes"));
  document.getElementById("tab-budget")?.addEventListener("click", () => openView("view-budget"));
  document.getElementById("tab-vault")?.addEventListener("click", () => openView("view-vault"));
  document.getElementById("tab-carte")?.addEventListener("click", () => openView("none"));

  document.getElementById("btn-prev-day")?.addEventListener("click", () => changeDay(-1));
  document.getElementById("btn-next-day")?.addEventListener("click", () => changeDay(1));

  const fr = document.getElementById("time-fr");
  const vn = document.getElementById("time-vn");

  function updateClocks() {
    const now = new Date();

    if (fr) {
      fr.textContent = now.toLocaleTimeString("fr-FR", {
        timeZone: "Europe/Paris",
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    if (vn) {
      vn.textContent = now.toLocaleTimeString("fr-FR", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  }

  document.getElementById("btn-theme")?.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    state.theme = document.body.classList.contains("dark-theme") ? "dark" : "light";
  });

  openView("view-etapes");
  renderPlanning();
  updateClocks();
  setInterval(updateClocks, 1000);
});