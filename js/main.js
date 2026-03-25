import { OsWindow } from './components/OsWindow.js';
import { GlobeEngine } from './map/GlobeEngine.js';
import { Database } from './db/Storage.js';
import { BudgetApp } from './components/BudgetApp.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 OS Ultimate en cours de démarrage...");

    // 1. Initialiser la carte 3D en fond
    const globe = new GlobeEngine('map-container');

    // 2. Initialiser la base de données locale (IndexedDB)
    const db = new Database();
    await db.init(); // On attend que la DB soit prête

    // 3. Lancer l'application Budget et la lier à la DB
    const budget = new BudgetApp(db);
    
    console.log("✅ Système prêt à l'emploi.");
});