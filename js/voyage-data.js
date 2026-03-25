/**
 * voyage-data.js — Données du voyage Vietnam 2026
 * Gestion du state + persistance localStorage
 */

const STORAGE_KEY = 'vn_voyage_os_ultimate_v2';

// ─── DONNÉES PAR DÉFAUT ───────────────────────────────────────────────────────

const DEFAULT_VOYAGE = [
    {
        jour: 1, date: '13 Avril', ville: 'Départ → Istanbul',
        lat: 41.0082, lon: 28.9784, zoomMap: 8_000_000,
        transport: 'Vol Paris CDG → Istanbul IST',
        logements: [],
        activites: [{ nom: 'Escale Istanbul', lien: '', periode: 'aprem' }],
        alerts: ['Vérifier documents de voyage'],
        journal: { stars: 0, text: '' },
    },
    {
        jour: 2, date: '14 Avril', ville: 'Hanoï',
        lat: 21.0285, lon: 105.8542, zoomMap: 60_000,
        transport: 'Vol Istanbul IST → Hanoï HAN',
        logements: [{ nom: 'Aimee House Hanoi', lien: '' }],
        activites: [
            { nom: 'Lac Hoan Kiem', lien: '', periode: 'aprem' },
            { nom: 'Dîner Bun Cha', lien: '', periode: 'soir' },
        ],
        alerts: [],
        journal: { stars: 0, text: '' },
    },
    {
        jour: 3, date: '15 Avril', ville: 'Hanoï',
        lat: 21.0285, lon: 105.8542, zoomMap: 60_000,
        transport: '',
        logements: [{ nom: 'Aimee House Hanoi', lien: '' }],
        activites: [
            { nom: 'Vieux quartier de Hanoï', lien: '', periode: 'matin' },
            { nom: 'Train Street', lien: '', periode: 'aprem' },
            { nom: 'Temple de la Littérature', lien: '', periode: 'aprem' },
        ],
        alerts: [],
        journal: { stars: 0, text: '' },
    },
    {
        jour: 4, date: '16 Avril', ville: 'Ninh Binh',
        lat: 20.2539, lon: 105.9800, zoomMap: 80_000,
        transport: 'Bus 12Go (Matin — 2h30)',
        logements: [{ nom: 'Hang Mua Ecolodge', lien: '' }],
        activites: [
            { nom: 'Barque Trang An', lien: '', periode: 'matin' },
            { nom: 'Coucher de soleil Mua Cave', lien: '', periode: 'aprem' },
        ],
        alerts: [],
        journal: { stars: 0, text: '' },
    },
    {
        jour: 5, date: '17 Avril', ville: 'Ninh Binh → Pu Luong',
        lat: 20.4533, lon: 105.2280, zoomMap: 90_000,
        transport: 'Transfert Van privé',
        logements: [{ nom: 'Pu Luong Nature Reserve', lien: '' }],
        activites: [
            { nom: 'Arrivée jungle — rizières en terrasses', lien: '', periode: 'aprem' },
        ],
        alerts: [],
        journal: { stars: 0, text: '' },
    },
    {
        jour: 6, date: '18 Avril', ville: 'Pu Luong',
        lat: 20.4533, lon: 105.2280, zoomMap: 70_000,
        transport: '',
        logements: [{ nom: 'Pu Luong Nature Reserve', lien: '' }],
        activites: [
            { nom: 'Trek rizières en terrasses', lien: '', periode: 'matin' },
            { nom: 'Village Thái', lien: '', periode: 'aprem' },
        ],
        alerts: [],
        journal: { stars: 0, text: '' },
    },
    {
        jour: 7, date: '19 Avril', ville: 'Baie de Lan Ha',
        lat: 20.7280, lon: 107.0500, zoomMap: 120_000,
        transport: 'Transfert vers la baie',
        logements: [{ nom: 'Aspira Cruise — Croisière Lan Ha Bay', lien: '' }],
        activites: [
            { nom: 'Kayak grottes', lien: '', periode: 'aprem' },
            { nom: 'Coucher de soleil sur la baie', lien: '', periode: 'soir' },
        ],
        alerts: ['💳 Payer solde Aspira Cruise'],
        journal: { stars: 0, text: '' },
    },
    {
        jour: 8, date: '20 Avril', ville: 'Train de nuit',
        lat: 21.0285, lon: 105.8542, zoomMap: 200_000,
        transport: 'Train de nuit Hanoï → Hué (SE3)',
        logements: [{ nom: 'Cabine train couchette', lien: '' }],
        activites: [
            { nom: 'Retour croisière → Hanoï', lien: '', periode: 'matin' },
            { nom: 'Départ train 19h30', lien: '', periode: 'soir' },
        ],
        alerts: [],
        journal: { stars: 0, text: '' },
    },
    {
        jour: 9, date: '21 Avril', ville: 'Hué',
        lat: 16.4637, lon: 107.5909, zoomMap: 60_000,
        transport: 'Arrivée train 11h00',
        logements: [{ nom: 'Hôtel Hué centre', lien: '' }],
        activites: [
            { nom: 'Cité Impériale', lien: '', periode: 'aprem' },
            { nom: 'Bún bò Huế (spécialité locale)', lien: '', periode: 'soir' },
        ],
        alerts: [],
        journal: { stars: 0, text: '' },
    },
    {
        jour: 10, date: '22 Avril', ville: 'Hué → Hoi An',
        lat: 15.8801, lon: 108.3380, zoomMap: 150_000,
        transport: 'Voiture Col des Nuages (Hai Van Pass)',
        logements: [{ nom: 'Hôtel Hoi An', lien: '' }],
        activites: [
            { nom: 'Panorama Hai Van Pass', lien: '', periode: 'matin' },
            { nom: 'Vieille ville Hoi An la nuit', lien: '', periode: 'soir' },
        ],
        alerts: ['🚤 Réserver bateau Îles Cham'],
        journal: { stars: 0, text: '' },
    },
    {
        jour: 11, date: '23 Avril', ville: 'Hoi An',
        lat: 15.8801, lon: 108.3380, zoomMap: 40_000,
        transport: 'Scooter / Vélo',
        logements: [{ nom: 'Hôtel Hoi An', lien: '' }],
        activites: [
            { nom: 'Plage An Bang', lien: '', periode: 'matin' },
            { nom: 'Marché de nuit Hoi An', lien: '', periode: 'soir' },
        ],
        alerts: [],
        journal: { stars: 0, text: '' },
    },
    {
        jour: 12, date: '24 Avril', ville: 'Îles Cham',
        lat: 15.9590, lon: 108.5230, zoomMap: 50_000,
        transport: 'Bateau rapide (1h)',
        logements: [{ nom: 'Homestay Îles Cham', lien: '' }],
        activites: [
            { nom: 'Snorkeling récifs coralliens', lien: '', periode: 'matin' },
            { nom: 'Balade île', lien: '', periode: 'aprem' },
        ],
        alerts: [],
        journal: { stars: 0, text: '' },
    },
    {
        jour: 13, date: '25 Avril', ville: 'Da Nang',
        lat: 16.0544, lon: 108.2022, zoomMap: 90_000,
        transport: 'Bateau retour + Grab',
        logements: [{ nom: 'Hôtel Da Nang beach', lien: '' }],
        activites: [
            { nom: 'Pont du Dragon (crache du feu le soir)', lien: '', periode: 'soir' },
        ],
        alerts: [],
        journal: { stars: 0, text: '' },
    },
    {
        jour: 14, date: '26 Avril', ville: 'Da Nang',
        lat: 16.0544, lon: 108.2022, zoomMap: 80_000,
        transport: '',
        logements: [{ nom: 'Hôtel Da Nang beach', lien: '' }],
        activites: [
            { nom: 'Lady Buddha — Bán Đà Sơn', lien: '', periode: 'matin' },
            { nom: 'Plage My Khe', lien: '', periode: 'aprem' },
        ],
        alerts: [],
        journal: { stars: 0, text: '' },
    },
    {
        jour: 15, date: '27 Avril', ville: 'Départ Da Nang',
        lat: 16.0544, lon: 108.2022, zoomMap: 8_000_000,
        transport: 'Vol Da Nang DAD → Istanbul IST',
        logements: [],
        activites: [
            { nom: 'Achats souvenirs matin', lien: '', periode: 'matin' },
        ],
        alerts: ['🛂 Check-in en ligne à faire'],
        journal: { stars: 0, text: '' },
    },
    {
        jour: 16, date: '28 Avril', ville: 'Retour France',
        lat: 48.8566, lon: 2.3522, zoomMap: 8_000_000,
        transport: 'Vol Istanbul IST → Paris CDG',
        logements: [],
        activites: [
            { nom: '🏠 Arrivée à la maison !', lien: '', periode: 'aprem' },
        ],
        alerts: [],
        journal: { stars: 0, text: '' },
    },
];

// ─── STATE ────────────────────────────────────────────────────────────────────

let voyage = loadVoyage();
let currentDayIndex = 0;

function loadVoyage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.warn('[VoyageData] localStorage corrompu, reset.');
    }
    return JSON.parse(JSON.stringify(DEFAULT_VOYAGE)); // Deep copy
}

export function saveVoyage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(voyage));
    } catch (e) {
        console.warn('[VoyageData] Erreur localStorage:', e);
    }
}

export function resetVoyage() {
    voyage = JSON.parse(JSON.stringify(DEFAULT_VOYAGE));
    saveVoyage();
    return voyage;
}

// ─── GETTERS ─────────────────────────────────────────────────────────────────

export function getVoyage() { return voyage; }
export function getDay(index) { return voyage[index]; }
export function getDayCount() { return voyage.length; }
export function getCurrentDayIndex() { return currentDayIndex; }
export function setCurrentDayIndex(i) { currentDayIndex = i; }

// ─── CRUD ACTIVITÉS ──────────────────────────────────────────────────────────

export function addActivite(dayIdx, nom, lien = '', periode = 'matin') {
    if (!nom.trim()) return false;
    // Détection auto alerte
    const isAlert = /payer|rappel|alerte|réserver|reserver|confirmer/i.test(nom);
    if (isAlert) {
        voyage[dayIdx].alerts.push(nom.trim());
    } else {
        voyage[dayIdx].activites.push({ nom: nom.trim(), lien: lien.trim(), periode });
    }
    saveVoyage();
    return true;
}

export function deleteActivite(dayIdx, itemIdx) {
    voyage[dayIdx].activites.splice(itemIdx, 1);
    saveVoyage();
}

export function deleteAlert(dayIdx, itemIdx) {
    voyage[dayIdx].alerts.splice(itemIdx, 1);
    saveVoyage();
}

export function deleteLogement(dayIdx, itemIdx) {
    voyage[dayIdx].logements.splice(itemIdx, 1);
    saveVoyage();
}

// ─── JOURNAL ─────────────────────────────────────────────────────────────────

export function setJournalStars(dayIdx, stars) {
    voyage[dayIdx].journal.stars = stars;
    saveVoyage();
}

export function setJournalText(dayIdx, text) {
    voyage[dayIdx].journal.text = text;
    saveVoyage();
}

export function appendJournalText(dayIdx, text) {
    voyage[dayIdx].journal.text += text;
    saveVoyage();
}
