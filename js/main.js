import { OsWindow } from './components/OsWindow.js';
import { GlobeEngine } from './map/GlobeEngine.js';
import { Database } from './db/Storage.js';
import { BudgetApp } from './components/BudgetApp.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialiser le Globe 3D
    const globe = new GlobeEngine('map-container');

    // 2. Initialiser la Base de données et l'App Budget
    try {
        const db = new Database();
        await db.init(); 
        const budget = new BudgetApp(db);
        console.log("✅ Système 100% Opérationnel !");
    } catch (error) {
        console.error("Erreur de base de données. Es-tu sur un serveur local ?", error);
        alert("Attention : Le mode hors-ligne semble bloqué par le navigateur.");
    }
});