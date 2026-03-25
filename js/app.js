import { state } from './state.js';
import { APP_CONFIG } from './config.js';
import { loadStateFromStorage, saveTheme } from './storage.js';
import { renderPlanning, changeDay, changeDayTo } from './features/planning.js';
import { initBudget } from './features/budget.js';
import { initSurvival } from './features/survival.js';
import { initMapEngine, mapFlyToLocation, mapFlyToUser, mapResize } from './map/map-engine.js';
import { initWindows, refreshWindowsLayout } from './ui/windows.js';
import { initNavigation } from './ui/navigation.js';

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadStateFromStorage();
  document.body.classList.toggle('dark-theme', state.theme === 'dark');

  function syncMapToCurrentDay() {
    const day = state.trip[state.currentDayIdx];
    if (!day) return;
    mapFlyToLocation({ lat: day.lat, lon: day.lon, zoomMap: day.zoomMap });
  }

  function renderCurrentDay() {
    renderPlanning();
    syncMapToCurrentDay();
    navigation.renderCarousel();
    updateProgress();
  }

  function updateClocks() {
    const now = new Date();
    document.getElementById('time-fr').textContent = now.toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' });
    document.getElementById('time-vn').textContent = now.toLocaleTimeString('fr-FR', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });
  }

  function updateProgress() {
    const start = new Date(APP_CONFIG.trip.startDateISO).getTime();
    const end = new Date(APP_CONFIG.trip.endDateISO).getTime();
    const now = Date.now();
    const el = document.getElementById('progress-container-div');
    if (now < start) {
      const daysLeft = Math.ceil((start - now) / (1000 * 3600 * 24));
      el.innerHTML = `<div class="countdown-text">⏳ Départ dans ${daysLeft} jours</div>`;
      return;
    }
    const prog = now >= end ? 100 : ((now - start) / (end - start)) * 100;
    el.innerHTML = `<div class="progress-track"><div class="progress-fill" style="width:${prog}%"></div></div>`;
  }

  const navigation = initNavigation();
  initWindows();
  initMapEngine({ onCitySelect: (dayIdx) => { changeDayTo(dayIdx); renderCurrentDay(); navigation.openView('view-etapes'); } });

  document.getElementById('btn-prev-day')?.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); changeDay(-1); renderCurrentDay(); });
  document.getElementById('btn-next-day')?.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); changeDay(1); renderCurrentDay(); });
  document.getElementById('btn-theme')?.addEventListener('click', () => { document.body.classList.toggle('dark-theme'); state.theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light'; saveTheme(); });
  document.getElementById('btn-geolocate')?.addEventListener('click', () => mapFlyToUser());
  window.addEventListener('resize', () => { refreshWindowsLayout(); mapResize(); });
  document.addEventListener('osultimate:daychange', renderCurrentDay);

  renderCurrentDay();
  initBudget();
  initSurvival();
  updateClocks();
  updateProgress();
  setInterval(updateClocks, 1000);
  registerServiceWorker();
});
