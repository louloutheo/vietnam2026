import { OsWindow } from './components/OsWindow.js';
import { GlobeEngine } from './map/GlobeEngine.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 OS Ultimate démarré avec succès !");

    // Lancement de la carte 3D
    const globe = new GlobeEngine('map-container');
});