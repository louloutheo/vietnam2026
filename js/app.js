import { state } from "./state.js";
import { loadStateFromStorage } from "./storage.js";
import { renderPlanning, changeDay, changeDayTo } from "./features/planning.js";
import { initBudget } from "./features/budget.js";
import { initSurvival } from "./features/survival.js";
import { initMapEngine, mapFlyToLocation, mapFlyToUser, mapResize } from "./map/map-engine.js";

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

  function syncMapToCurrentDay() {
    const day = state.trip[state.currentDayIdx];
    if (!day) return;

    mapFlyToLocation({
      lat: day.lat,
      lon: day.lon,
      zoomMap: day.zoomMap
    });
  }

  function renderCurrentDay() {
    renderPlanning();
    syncMapToCurrentDay();
  }

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

  initMapEngine({
    onCitySelect: (dayIdx) => {
      changeDayTo(dayIdx);
      renderCurrentDay();
      openView("view-etapes");
    }
  });

  document.getElementById("tab-planning")?.addEventListener("click", () => {
    openView("view-etapes");
  });

  document.getElementById("tab-budget")?.addEventListener("click", () => {
    openView("view-budget");
  });

  document.getElementById("tab-vault")?.addEventListener("click", () => {
    openView("view-vault");
  });

  document.getElementById("tab-carte")?.addEventListener("click", () => {
    openView("none");
  });

  document.getElementById("btn-prev-day")?.addEventListener("click", () => {
    changeDay(-1);
    syncMapToCurrentDay();
  });

  document.getElementById("btn-next-day")?.addEventListener("click", () => {
    changeDay(1);
    syncMapToCurrentDay();
  });

  document.getElementById("btn-theme")?.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    state.theme = document.body.classList.contains("dark-theme") ? "dark" : "light";
  });

  document.getElementById("btn-geolocate")?.addEventListener("click", () => {
    mapFlyToUser();
  });

  window.addEventListener("resize", () => {
    mapResize();
  });

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

  openView("view-etapes");
  renderCurrentDay();
  initBudget();
  initSurvival();
  updateClocks();
  setInterval(updateClocks, 1000);
});