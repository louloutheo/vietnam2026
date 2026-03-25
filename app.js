import { initGlobe } from './modules/globe.js';

// Test de vie immédiat
console.log("JS : app.js est bien chargé");
alert("OS Ultimate : Système d'exploitation spatial lancé !");

document.addEventListener('DOMContentLoaded', () => {
    try {
        const map = initGlobe();
        console.log("L0 : Globe initialisé avec succès");
    } catch (error) {
        console.error("Erreur critique au lancement du globe :", error);
    }
});