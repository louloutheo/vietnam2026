import { state } from '../state.js';
import { clamp, formatMapLink, getTransportIcon } from '../utils.js';
import { saveTrip } from '../storage.js';
import { fetchWeatherForDay } from '../services/weather.service.js';

export function changeDay(direction) {
  state.currentDayIdx = clamp(state.currentDayIdx + direction, 0, state.trip.length - 1);
}
export function changeDayTo(index) {
  state.currentDayIdx = clamp(index, 0, state.trip.length - 1);
}

function renderActivities(list, cssClass = 'activity') {
  return list.map((activity) => `
    <div class="timeline-entry ${cssClass}">
      <div class="entry-top"><div class="entry-title">${activity.nom}</div></div>
      <div class="entry-sub">${activity.periode || ''}</div>
      ${activity.lien ? `<a class="entry-link" href="${formatMapLink(activity.lien)}" target="_blank">Ouvrir dans Maps ↗</a>` : ''}
    </div>
  `).join('');
}

function renderStars(stars) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="${i <= stars ? 'active' : ''}" data-star="${i}">★</span>`;
  }
  return html;
}

export function renderPlanning() {
  const day = state.trip[state.currentDayIdx];
  if (!day) return;

  document.getElementById('day-title').textContent = `Jour ${day.jour}`;
  document.getElementById('day-date').textContent = `${day.date} - ${day.ville}`;
  document.getElementById('weather-box').textContent = state.weatherCache[day.jour] ? `🌡️ ${state.weatherCache[day.jour]}°C prévu` : '⛅ Météo...';

  const matin = day.activites.filter((a) => (a.periode || 'matin') === 'matin');
  const aprem = day.activites.filter((a) => (a.periode || 'aprem') !== 'matin');

  let html = '';
  if (day.transport) {
    html += `<div class="timeline-group"><div class="timeline-label">Transport</div><div class="timeline-entry transport"><div class="entry-title">${getTransportIcon(day.transport)} ${day.transport}</div></div></div>`;
  }
  if (day.alerts?.length) {
    html += `<div class="timeline-group"><div class="timeline-label">Alertes</div>${day.alerts.map((alert) => `<div class="timeline-entry alert"><div class="entry-title">🔔 ${alert}</div></div>`).join('')}</div>`;
  }
  if (matin.length) {
    html += `<div class="timeline-group"><div class="timeline-label">Matin</div>${renderActivities(matin)}</div>`;
  }
  if (aprem.length) {
    html += `<div class="timeline-group"><div class="timeline-label">Après-midi & Soir</div>${renderActivities(aprem)}</div>`;
  }
  if (day.logements?.length) {
    html += `<div class="timeline-group"><div class="timeline-label">Logement</div>${day.logements.map((l) => `<div class="timeline-entry hotel"><div class="entry-title">🏨 ${l.nom}</div>${l.lien ? `<a class="entry-link" href="${formatMapLink(l.lien)}" target="_blank">Y aller ↗</a>` : ''}</div>`).join('')}</div>`;
  }

  html += `
    <div class="journal-box">
      <div class="section-mini-title" style="text-align:center;margin-top:0;">📖 Bilan du jour</div>
      <div class="star-rating" id="journal-stars">${renderStars(day.journal?.stars || 0)}</div>
      <div class="keyword-chips">
        <span class="chip" data-chip="🥵 Chaleur extrême">🥵 Chaud</span>
        <span class="chip" data-chip="🤤 Régal absolu">🤤 Régal</span>
        <span class="chip" data-chip="🛵 Scooter trip">🛵 Scooter</span>
        <span class="chip" data-chip="🤕 Fatigué(e)">🤕 KO</span>
      </div>
      <div style="display:flex;gap:8px;align-items:flex-start;">
        <textarea id="journal-text" class="journal-textarea" placeholder="Note du soir...">${day.journal?.text || ''}</textarea>
        <button class="mic-btn" id="journal-mic">🎙️</button>
      </div>
    </div>
  `;

  document.getElementById('day-content').innerHTML = html;
  bindPlanningEvents();
  updateWeather(day);
}

function bindPlanningEvents() {
  const day = state.trip[state.currentDayIdx];
  document.querySelectorAll('#journal-stars [data-star]').forEach((starEl) => {
    starEl.addEventListener('click', () => {
      day.journal.stars = Number(starEl.dataset.star);
      saveTrip();
      renderPlanning();
    });
  });

  document.querySelectorAll('[data-chip]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const textarea = document.getElementById('journal-text');
      textarea.value += `[${chip.dataset.chip}] `;
      day.journal.text = textarea.value;
      saveTrip();
    });
  });

  document.getElementById('journal-text')?.addEventListener('blur', (event) => {
    day.journal.text = event.target.value;
    saveTrip();
  });

  document.getElementById('journal-mic')?.addEventListener('click', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const textarea = document.getElementById('journal-text');
      textarea.value += `${event.results[0][0].transcript} `;
      day.journal.text = textarea.value;
      saveTrip();
    };
    recognition.start();
  });
}

async function updateWeather(day) {
  if (state.weatherCache[day.jour]) return;
  try {
    const temp = await fetchWeatherForDay(day);
    state.weatherCache[day.jour] = temp;
    if (state.trip[state.currentDayIdx]?.jour === day.jour) {
      document.getElementById('weather-box').textContent = `🌡️ ${temp}°C prévu`;
    }
  } catch {
    if (state.trip[state.currentDayIdx]?.jour === day.jour) {
      document.getElementById('weather-box').textContent = '⛅ Météo indispo';
    }
  }
}
