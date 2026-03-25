/**
 * main.js — Point d'entrée de l'application OS Ultimate
 *
 * Orchestre l'initialisation de tous les modules :
 * map-engine → voyage-data → ui-windows → planning → budget → survie
 */

import { initMap, flyToStep, addCityMarker, setRouteCoordinates, geolocateUser, toggleMapTheme, getMap } from './map-engine.js';
import { getVoyage, getCurrentDayIndex, setCurrentDayIndex, getDayCount } from './voyage-data.js';
import { initWindows, showWindow, hideAllWindows } from './ui-windows.js';
import { initPlanning, renderDay } from './planning.js';
import { initBudget } from './budget.js';
import { initSurvie } from './survie.js';

// ─── DONNÉES DU VOYAGE ────────────────────────────────────────────────────────
const voyage = getVoyage();

// Coordonnées de l'itinéraire pour le tracé
const ROUTE_COORDS = voyage.map(d => [d.lon, d.lat]);

// Villes = étapes avec marqueurs sur la carte
const CITIES = voyage.map((d, i) => ({
    name: d.ville.split('→')[0].trim(),
    lon: d.lon,
    lat: d.lat,
    dayIndex: i,
}));

// ─── INITIALISATION ───────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // 1. Carte
    const map = initMap('map');

    map.on('load', () => {
        // Tracé itinéraire
        setRouteCoordinates(ROUTE_COORDS);

        // Marqueurs des villes
        CITIES.forEach(city => {
            addCityMarker(city, (c) => {
                navigateToDay(c.dayIndex);
                showWindow('win-planning');
                updateActiveTab('tab-planning');
            });
        });
    });

    // Re-appliquer route + markers après changement de thème
    map.on('os:style-reloaded', () => {
        setRouteCoordinates(ROUTE_COORDS);
        CITIES.forEach(city => {
            addCityMarker(city, (c) => {
                navigateToDay(c.dayIndex);
                showWindow('win-planning');
                updateActiveTab('tab-planning');
            });
        });
    });

    // 2. UI Smart OS
    initWindows();

    // 3. Modules métier
    initPlanning({ onDayChange: navigateToDay });
    initBudget();
    initSurvie();

    // 4. Navigation Dock
    initDock();

    // 5. Carrousel jours
    initCarousel();

    // 6. Top bar (horloge + progression)
    initTopBar();

    // 7. Boutons outils carte
    document.getElementById('btn-geolocate').addEventListener('click', geolocateUser);
    document.getElementById('btn-theme').addEventListener('click', () => {
        const dark = toggleMapTheme();
        document.body.classList.toggle('dark-theme', dark);
    });

    // 8. Focus auto sur le jour courant du voyage
    autoFocusToday();

    // 9. Ouvrir Planning par défaut
    showWindow('win-planning');
    updateActiveTab('tab-planning');
});

// ═══════════════════════════════════════════════════════════════════════════════
// NAVIGATION PAR JOUR
// ═══════════════════════════════════════════════════════════════════════════════

function navigateToDay(index) {
    const clamped = Math.max(0, Math.min(index, getDayCount() - 1));
    setCurrentDayIndex(clamped);

    const day = voyage[clamped];
    flyToStep(day.lon, day.lat, day.zoomMap);
    renderDay(clamped);
    updateCarouselActive(clamped);
}

function autoFocusToday() {
    const tripStart = new Date('2026-04-13T00:00:00').getTime();
    const dayDiff = Math.floor((Date.now() - tripStart) / (1000 * 3600 * 24));
    const idx = Math.max(0, Math.min(dayDiff, getDayCount() - 1));
    // Si le voyage n'a pas encore commencé, on reste sur le jour 0
    navigateToDay(dayDiff >= 0 && dayDiff < getDayCount() ? dayDiff : 0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCK DE NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════

let activeTab = 'tab-planning';

function initDock() {
    document.querySelectorAll('.dock-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            const isAlreadyActive = btn.id === activeTab;

            if (target === 'none' || isAlreadyActive) {
                // Clic sur Carte ou double-clic sur onglet actif → ferme tout
                hideAllWindows();
                updateActiveTab('tab-carte');
                showCarousel(true);
            } else {
                showWindow(target);
                updateActiveTab(btn.id);
                showCarousel(false);
            }
        });
    });
}

function updateActiveTab(tabId) {
    activeTab = tabId;
    document.querySelectorAll('.dock-item').forEach(btn => {
        btn.classList.toggle('active', btn.id === tabId);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARROUSEL JOURS
// ═══════════════════════════════════════════════════════════════════════════════

function initCarousel() {
    const carousel = document.getElementById('day-carousel');
    carousel.innerHTML = voyage.map((d, i) => `
        <button class="carousel-pill ${i === getCurrentDayIndex() ? 'active' : ''}"
                data-index="${i}"
                aria-label="Aller au jour ${d.jour}">
            J${d.jour} · ${d.ville.split('→')[0].trim().substring(0, 8).toUpperCase()}
        </button>
    `).join('');

    carousel.addEventListener('click', (e) => {
        const pill = e.target.closest('.carousel-pill');
        if (!pill) return;
        const idx = parseInt(pill.dataset.index);
        navigateToDay(idx);
        showWindow('win-planning');
        updateActiveTab('tab-planning');
        showCarousel(false);
    });
}

function updateCarouselActive(index) {
    document.querySelectorAll('.carousel-pill').forEach((pill, i) => {
        pill.classList.toggle('active', i === index);
        if (i === index) {
            pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    });
}

function showCarousel(visible) {
    document.getElementById('day-carousel').style.display = visible ? 'flex' : 'none';
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOP BAR : HORLOGE + PROGRESSION
// ═══════════════════════════════════════════════════════════════════════════════

function initTopBar() {
    updateTopBar();
    setInterval(updateTopBar, 1000);
}

function updateTopBar() {
    const now = new Date();

    // Horloges
    const optTime = { hour: '2-digit', minute: '2-digit' };
    document.getElementById('time-vn').textContent =
        now.toLocaleTimeString('fr-FR', { ...optTime, timeZone: 'Asia/Ho_Chi_Minh' });
    document.getElementById('time-fr').textContent =
        now.toLocaleTimeString('fr-FR', { ...optTime, timeZone: 'Europe/Paris' });

    // Progression voyage
    const tripStart = new Date('2026-04-13T00:00:00').getTime();
    const tripEnd   = new Date('2026-04-28T23:59:59').getTime();
    const container = document.getElementById('progress-container');

    if (now < tripStart) {
        const daysLeft = Math.ceil((tripStart - now) / (1000 * 3600 * 24));
        container.innerHTML = `<div class="countdown">⏳ Départ dans <strong>${daysLeft}</strong> jours</div>`;
    } else if (now > tripEnd) {
        container.innerHTML = `<div class="countdown">🏠 Retour à la maison !</div>`;
    } else {
        const pct = Math.round(((now - tripStart) / (tripEnd - tripStart)) * 100);
        container.innerHTML = `
            <div class="progress-track">
                <div class="progress-fill" style="width:${pct}%"></div>
            </div>
            <div class="progress-label">${pct}% du voyage</div>
        `;
    }
}

// ─── Navigation jours exposée globalement (utilisée par planning.js) ──────────
window.osNavigateToDay = navigateToDay;
