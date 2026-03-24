import { state } from "./state.js";
import { APP_CONFIG } from "./config.js";
import { loadStateFromStorage } from "./storage.js";
import { renderPlanning, changeDay, changeDayTo } from "./features/planning.js";
import { initBudget } from "./features/budget.js";
import { initSurvival } from "./features/survival.js";
import { initMapEngine, mapFlyToLocation, mapFlyToUser, mapResize } from "./map/map-engine.js";
import { initWindows, refreshWindowsLayout } from "./ui/windows.js";
import { initNavigation } from "./ui/navigation.js";
import { initCarousel } from "./ui/carousel.js";
import { initThemeToggle } from "./ui/theme.js";

document.addEventListener("DOMContentLoaded", () => {
  loadStateFromStorage();
  if (state.theme === "dark") document.body.classList.add("dark-theme"); else document.body.classList.remove("dark-theme");

  function syncMapToCurrentDay() {
    const day = state.trip[state.currentDayIdx];
    if (!day) return;
    mapFlyToLocation({ lat: day.lat, lon: day.lon, zoomMap: day.zoomMap });
  }

  function renderCurrentDay() {
    renderPlanning();
    syncMapToCurrentDay();
    carousel.render();
    renderProgress();
  }

  const navigation = initNavigation();
  initWindows();
  initThemeToggle();

  const carousel = initCarousel((dayIdx) => {
    changeDayTo(dayIdx);
    renderCurrentDay();
    navigation.openView("view-etapes");
  });

  initMapEngine({
    onCitySelect: (dayIdx) => {
      changeDayTo(dayIdx);
      renderCurrentDay();
      navigation.openView("view-etapes");
    }
  });

  document.getElementById("btn-prev-day")?.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); changeDay(-1); renderCurrentDay(); });
  document.getElementById("btn-next-day")?.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); changeDay(1); renderCurrentDay(); });
  document.getElementById("btn-geolocate")?.addEventListener("click", () => mapFlyToUser());

  window.addEventListener("resize", () => { refreshWindowsLayout(); mapResize(); });

  const fr = document.getElementById("time-fr");
  const vn = document.getElementById("time-vn");
  function updateClocks() {
    const now = new Date();
    if (fr) fr.textContent = now.toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" });
    if (vn) vn.textContent = now.toLocaleTimeString("fr-FR", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit" });
  }

  function renderProgress() {
    const wrap = document.getElementById("progress-container-div");
    if (!wrap) return;
    const tripStart = new Date(APP_CONFIG.trip.startDateISO).getTime();
    const tripEnd = new Date(APP_CONFIG.trip.endDateISO).getTime();
    const now = Date.now();
    let html = "";
    if (now < tripStart) {
      const daysLeft = Math.ceil((tripStart - now) / (1000 * 3600 * 24));
      html = `<div class="progress-label">⏳ Départ dans ${daysLeft} jours</div>`;
    } else {
      const progress = Math.max(0, Math.min(100, ((now - tripStart) / (tripEnd - tripStart)) * 100));
      html = `<div class="progress-shell"><div class="progress-bar" style="width:${progress}%"></div></div>`;
    }
    wrap.innerHTML = html;
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  }

  initBudget();
  initSurvival();
  updateClocks();
  renderCurrentDay();
  setInterval(updateClocks, 1000);
});
