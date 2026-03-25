/**
 * planning.js — Module Planning
 */

import {
    getVoyage, getDay, getDayCount, getCurrentDayIndex, setCurrentDayIndex,
    addActivite, deleteActivite, deleteAlert, deleteLogement,
    setJournalStars, setJournalText, appendJournalText, saveVoyage,
} from './voyage-data.js';

let onDayChangeCb = null;

export function initPlanning({ onDayChange }) {
    onDayChangeCb = onDayChange;

    document.getElementById('btn-prev-day').addEventListener('click', () => {
        const idx = getCurrentDayIndex() - 1;
        if (idx >= 0) onDayChangeCb(idx);
    });

    document.getElementById('btn-next-day').addEventListener('click', () => {
        const idx = getCurrentDayIndex() + 1;
        if (idx < getDayCount()) onDayChangeCb(idx);
    });

    renderDay(getCurrentDayIndex());
}

export function renderDay(idx) {
    setCurrentDayIndex(idx);
    const d = getDay(idx);
    if (!d) return;

    document.getElementById('day-title').textContent = `Jour ${d.jour}`;
    document.getElementById('day-date').textContent = `${d.date} · ${d.ville}`;

    // Météo
    fetchWeather(d.lat, d.lon);

    // Contenu timeline
    document.getElementById('day-content').innerHTML = buildTimelineHTML(d, idx);
    bindTimelineEvents(idx);
}

function fetchWeather(lat, lon) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,weathercode&timezone=Asia%2FHo_Chi_Minh&forecast_days=1`)
        .then(r => r.json())
        .then(data => {
            const temp = Math.round(data.daily.temperature_2m_max[0]);
            document.getElementById('weather-badge').textContent = `🌡️ ${temp}°C`;
        })
        .catch(() => {
            document.getElementById('weather-badge').textContent = '⛅ Météo indispo';
        });
}

function getTransportIcon(text) {
    const t = text.toLowerCase();
    if (t.includes('vol') || t.includes('avion')) return '✈️';
    if (t.includes('train')) return '🚆';
    if (t.includes('bus')) return '🚌';
    if (t.includes('bateau') || t.includes('ferry') || t.includes('croisière')) return '🚤';
    if (t.includes('voiture') || t.includes('grab') || t.includes('taxi')) return '🚗';
    if (t.includes('scooter') || t.includes('moto')) return '🛵';
    if (t.includes('vélo') || t.includes('velo')) return '🚲';
    if (t.includes('van') || t.includes('transfert')) return '🚐';
    return '🚌';
}

function mapsLink(lien, nom) {
    if (!lien) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nom)}`;
    if (lien.startsWith('http')) return lien;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lien)}`;
}

function buildTimelineHTML(d, idx) {
    let html = '<div class="timeline">';

    // Transport
    if (d.transport) {
        const icon = getTransportIcon(d.transport);
        html += `
            <div class="timeline-section-label">🛫 Transport</div>
            <div class="timeline-item">
                <div class="timeline-dot dot-transport"></div>
                <div class="timeline-card transport">
                    <div class="card-text"><span class="card-icon">${icon}</span>${d.transport}</div>
                </div>
            </div>`;
    }

    // Alertes
    if (d.alerts.length > 0) {
        html += `<div class="timeline-section-label">🔔 Rappels</div>`;
        d.alerts.forEach((al, i) => {
            html += `
                <div class="timeline-item">
                    <div class="timeline-dot dot-alert"></div>
                    <div class="timeline-card alert">
                        <div class="card-text"><span class="card-icon">🔔</span>${al}</div>
                        <div class="card-actions">
                            <button class="btn-delete" data-action="del-alert" data-day="${idx}" data-i="${i}">✕</button>
                        </div>
                    </div>
                </div>`;
        });
    }

    // Activités matin
    const matin = d.activites.filter((a, i) => a.periode === 'matin' || (!a.periode && i < d.activites.length / 2));
    const aprem  = d.activites.filter((a, i) => a.periode !== 'matin' || (!a.periode && i >= d.activites.length / 2));

    if (matin.length > 0) {
        html += `<div class="timeline-section-label">🌅 Matin</div>`;
        matin.forEach((a) => {
            const realIdx = d.activites.indexOf(a);
            html += buildActivityCard(a, idx, realIdx);
        });
    }

    if (aprem.length > 0) {
        html += `<div class="timeline-section-label">☀️ Après-midi & Soir</div>`;
        aprem.forEach((a) => {
            const realIdx = d.activites.indexOf(a);
            html += buildActivityCard(a, idx, realIdx);
        });
    }

    // Logements
    if (d.logements.length > 0) {
        html += `<div class="timeline-section-label">🌙 Nuit & Logement</div>`;
        d.logements.forEach((l, i) => {
            html += `
                <div class="timeline-item">
                    <div class="timeline-dot dot-hotel"></div>
                    <div class="timeline-card hotel">
                        <div class="card-text"><span class="card-icon">🏨</span>${l.nom}</div>
                        <div class="card-actions">
                            ${l.lien ? `<a href="${mapsLink(l.lien, l.nom)}" target="_blank" class="item-link" style="color:var(--purple)">Y aller ↗</a>` : ''}
                            <button class="btn-delete" data-action="del-logement" data-day="${idx}" data-i="${i}">✕</button>
                        </div>
                    </div>
                </div>`;
        });
    }

    html += '</div>'; // /timeline

    // Formulaire ajout
    html += `
        <div class="add-form">
            <div class="add-form-label">+ Ajouter une étape</div>
            <div class="add-form-row">
                <input type="text" id="add-nom" class="input-field" placeholder="Lieu, activité, restaurant...">
            </div>
            <div class="add-form-row">
                <input type="text" id="add-lien" class="input-field" placeholder="Lien Maps (optionnel)">
                <select id="add-periode" class="input-select">
                    <option value="matin">Matin</option>
                    <option value="aprem">Aprem / Soir</option>
                </select>
                <button class="btn-pill" id="btn-add-activite" style="padding:10px 14px;">+</button>
            </div>
        </div>`;

    // Journal
    const j = d.journal || { stars: 0, text: '' };
    const starsHTML = [1,2,3,4,5].map(i =>
        `<span class="star ${i <= j.stars ? 'active' : ''}" data-star="${i}" data-day="${idx}">★</span>`
    ).join('');

    html += `
        <div class="journal-box">
            <div class="journal-title">📖 Bilan du jour</div>
            <div class="star-rating">${starsHTML}</div>
            <div class="chips-row">
                <span class="chip" data-keyword="🥵 Chaleur extrême" data-day="${idx}">🥵 Chaud</span>
                <span class="chip" data-keyword="🤤 Régal absolu" data-day="${idx}">🤤 Régal</span>
                <span class="chip" data-keyword="🛵 Scooter trip" data-day="${idx}">🛵 Scooter</span>
                <span class="chip" data-keyword="🤕 Fatigué·e" data-day="${idx}">🤕 KO</span>
                <span class="chip" data-keyword="📸 Photos top" data-day="${idx}">📸 Photo</span>
            </div>
            <div class="journal-row">
                <textarea id="journal-txt" class="journal-textarea" placeholder="Note du soir...">${j.text}</textarea>
                <button class="mic-btn" id="btn-mic">🎙️</button>
            </div>
        </div>`;

    return html;
}

function buildActivityCard(a, dayIdx, realIdx) {
    return `
        <div class="timeline-item">
            <div class="timeline-dot dot-activity"></div>
            <div class="timeline-card activity">
                <div class="card-text">${a.nom}</div>
                <div class="card-actions">
                    ${a.lien ? `<a href="${mapsLink(a.lien, a.nom)}" target="_blank" class="item-link">Aller ↗</a>` : ''}
                    <button class="btn-delete" data-action="del-activite" data-day="${dayIdx}" data-i="${realIdx}">✕</button>
                </div>
            </div>
        </div>`;
}

function bindTimelineEvents(idx) {
    const content = document.getElementById('day-content');

    // Suppressions
    content.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const day = parseInt(btn.dataset.day);
        const i = parseInt(btn.dataset.i);

        if (action === 'del-activite')  deleteActivite(day, i);
        if (action === 'del-alert')     deleteAlert(day, i);
        if (action === 'del-logement')  deleteLogement(day, i);

        renderDay(day);
    });

    // Ajout activité
    document.getElementById('btn-add-activite')?.addEventListener('click', () => {
        const nom     = document.getElementById('add-nom').value;
        const lien    = document.getElementById('add-lien').value;
        const periode = document.getElementById('add-periode').value;
        if (addActivite(idx, nom, lien, periode)) renderDay(idx);
    });

    // Stars journal
    content.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', () => {
            setJournalStars(parseInt(star.dataset.day), parseInt(star.dataset.star));
            renderDay(parseInt(star.dataset.day));
        });
    });

    // Chips journal
    content.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const day = parseInt(chip.dataset.day);
            appendJournalText(day, `[${chip.dataset.keyword}] `);
            document.getElementById('journal-txt').value = getDay(day).journal.text;
        });
    });

    // Textarea journal
    document.getElementById('journal-txt')?.addEventListener('blur', (e) => {
        setJournalText(idx, e.target.value);
    });

    // Micro (dictée vocale)
    document.getElementById('btn-mic')?.addEventListener('click', () => {
        startDictation(idx);
    });
}

function startDictation(dayIdx) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Dictée non supportée sur ce navigateur.'); return; }

    const btn = document.getElementById('btn-mic');
    const txt = document.getElementById('journal-txt');
    const recognition = new SR();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;

    recognition.onstart = () => btn?.classList.add('recording');
    recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript + ' ';
        txt.value += transcript;
        appendJournalText(dayIdx, transcript);
    };
    recognition.onerror = () => btn?.classList.remove('recording');
    recognition.onend   = () => btn?.classList.remove('recording');
    recognition.start();
}
