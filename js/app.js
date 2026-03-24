import { state } from "./state.js";
import { loadStateFromStorage } from "./storage.js";
import { renderPlanning, changeDay, changeDayTo } from "./features/planning.js";
import { initBudget } from "./features/budget.js";
import { initSurvival } from "./features/survival.js";
import { initMapEngine, mapFlyToLocation, mapFlyToUser, mapResize } from "./map/map-engine.js";
import { initWindows, refreshWindowsLayout } from "./ui/windows.js";
import { initNavigation } from "./ui/navigation.js";

document.addEventListener("DOMContentLoaded", () => {
  loadStateFromStorage();

  if (state.theme === "dark") {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }

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

  const navigation = initNavigation();
  initWindows();

  initMapEngine({
    onCitySelect: (dayIdx) => {
      changeDayTo(dayIdx);
      renderCurrentDay();
      navigation.openView("view-etapes");
    }
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
    refreshWindowsLayout();
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

  renderCurrentDay();
  initBudget();
  initSurvival();
  updateClocks();
  setInterval(updateClocks, 1000);
});