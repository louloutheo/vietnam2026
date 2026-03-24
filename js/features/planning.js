import { state } from "../state.js";
import { clamp, formatMapLink, getTransportIcon } from "../utils.js";

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

  const titleEl = document.getElementById("day-title");
  const dateEl = document.getElementById("day-date");
  const weatherEl = document.getElementById("weather-box");
  const contentEl = document.getElementById("day-content");

  if (titleEl) titleEl.textContent = `Jour ${day.jour}`;
  if (dateEl) dateEl.textContent = `${day.date} - ${day.ville}`;
  if (weatherEl) weatherEl.textContent = "⛅ Météo...";

  let html = "";

  if (day.transport) {
    html += `
      <div class="card">
        <div><strong>${getTransportIcon(day.transport)} Transport</strong></div>
        <div style="margin-top:8px; color: var(--text-muted);">${day.transport}</div>
      </div>
    `;
  }

  if (day.alerts?.length) {
    html += `
      <div class="card">
        <div><strong>🔔 Alertes</strong></div>
        <div style="margin-top:10px; display:flex; flex-direction:column; gap:8px;">
          ${day.alerts.map(alert => `<div>${alert}</div>`).join("")}
        </div>
      </div>
    `;
  }

  if (day.activites?.length) {
    html += `
      <div class="card">
        <div><strong>🎒 Activités</strong></div>
        <div style="margin-top:10px; display:flex; flex-direction:column; gap:10px;">
          ${day.activites.map(activity => `
            <div style="padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.04); border:1px solid var(--glass-border);">
              <div style="font-weight:700;">${activity.nom}</div>
              <div style="margin-top:4px; font-size:12px; color:var(--text-muted);">${activity.periode || ""}</div>
              ${activity.lien ? `<a href="${formatMapLink(activity.lien)}" target="_blank" style="display:inline-block; margin-top:8px; color:var(--accent-blue); font-size:12px;">Ouvrir dans Maps ↗</a>` : ""}
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  if (day.logements?.length) {
    html += `
      <div class="card">
        <div><strong>🏨 Logement</strong></div>
        <div style="margin-top:10px; display:flex; flex-direction:column; gap:10px;">
          ${day.logements.map(logement => `
            <div style="padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.04); border:1px solid var(--glass-border);">
              <div style="font-weight:700;">${logement.nom}</div>
              ${logement.lien ? `<a href="${formatMapLink(logement.lien)}" target="_blank" style="display:inline-block; margin-top:8px; color:var(--accent-blue); font-size:12px;">Y aller ↗</a>` : ""}
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  if (!html) {
    html = `
      <div class="card">
        <div style="color: var(--text-muted);">Aucune donnée pour ce jour.</div>
      </div>
    `;
  }

  if (contentEl) contentEl.innerHTML = html;
}