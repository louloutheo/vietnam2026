import { state } from "../state.js";
import { clamp, formatMapLink, getTransportIcon } from "../utils.js";

function renderWeatherHint(day) {
  const key = `${day.lat},${day.lon}`;
  const cached = state.weatherCache[key];
  const weatherEl = document.getElementById("weather-box");
  if (!weatherEl) return;
  if (cached) {
    weatherEl.textContent = cached;
    return;
  }
  weatherEl.textContent = "⛅ Météo...";
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${day.lat}&longitude=${day.lon}&daily=temperature_2m_max&timezone=Asia%2FHo_Chi_Minh`)
    .then(r => r.json())
    .then(data => {
      const txt = data?.daily?.temperature_2m_max?.[0] != null ? `🌡️ ${Math.round(data.daily.temperature_2m_max[0])}°C` : "⛅ Météo...";
      state.weatherCache[key] = txt;
      weatherEl.textContent = txt;
    })
    .catch(()=>{weatherEl.textContent="⛅ Météo...";});
}

export function changeDay(direction) {
  state.currentDayIdx = clamp(state.currentDayIdx + direction, 0, state.trip.length - 1);
  renderPlanning();
}

export function changeDayTo(index) {
  state.currentDayIdx = clamp(index, 0, state.trip.length - 1);
  renderPlanning();
}

export function renderPlanning() {
  const day = state.trip[state.currentDayIdx];
  if (!day) return;

  document.getElementById("day-title").textContent = `Jour ${day.jour}`;
  document.getElementById("day-date").textContent = `${day.date} - ${day.ville}`;
  renderWeatherHint(day);

  const sections = [];

  if (day.transport) {
    sections.push(`
      <div class="card">
        <div class="timeline-item-title">${getTransportIcon(day.transport)} Transport</div>
        <div class="timeline-item-meta">${day.transport}</div>
      </div>`);
  }

  if (day.alerts?.length) {
    sections.push(`
      <div class="card">
        <div class="timeline-item-title">🔔 Alertes</div>
        <div class="timeline-list">${day.alerts.map(a => `<div class="timeline-item-card"><div class="timeline-item-title">${a}</div></div>`).join("")}</div>
      </div>`);
  }

  if (day.activites?.length) {
    sections.push(`
      <div class="card">
        <div class="timeline-item-title">🎒 Activités</div>
        <div class="timeline-list">${day.activites.map(a => `
          <div class="timeline-item-card">
            <div class="timeline-item-title">${a.nom}</div>
            <div class="timeline-item-meta">${a.periode || ""}</div>
            ${a.lien ? `<a href="${formatMapLink(a.lien)}" target="_blank" class="item-link">Ouvrir Maps ↗</a>` : ""}
          </div>`).join("")}
        </div>
      </div>`);
  }

  if (day.logements?.length) {
    sections.push(`
      <div class="card">
        <div class="timeline-item-title">🏨 Logement</div>
        <div class="timeline-list">${day.logements.map(l => `
          <div class="timeline-item-card">
            <div class="timeline-item-title">${l.nom}</div>
            ${l.lien ? `<a href="${formatMapLink(l.lien)}" target="_blank" class="item-link">Y aller ↗</a>` : ""}
          </div>`).join("")}
        </div>
      </div>`);
  }

  document.getElementById("day-content").innerHTML = sections.join("") || `<div class="card"><div class="muted-center">Aucune donnée pour ce jour.</div></div>`;
}
