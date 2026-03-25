export class GlobeEngine {
    constructor(containerId) {
        // Initialisation de MapLibre (qui est chargé globalement via l'index.html)
        this.map = new maplibregl.Map({
            container: containerId,
            // Style de base gratuit pour le prototypage
            style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json', 
            center: [105.85, 21.02], // Coordonnées du Vietnam
            zoom: 1.5, // Très dézoomé pour voir la courbure
            pitch: 30, // Angle de la caméra
            projection: { type: 'globe' } // 🌍 Activation du mode 3D
        });

        this.map.on('load', () => {
            console.log("🌍 Moteur Globe 3D initialisé !");
            this.spinGlobe();
        });
    }

    // Petite animation de rotation lente si on est dézoomé
    spinGlobe() {
        const zoom = this.map.getZoom();
        if (zoom < 3) {
            let center = this.map.getCenter();
            center.lng += 0.2; // Vitesse de rotation
            this.map.easeTo({ center, duration: 1000, easing: (n) => n });
            
            // Boucle 60FPS
            requestAnimationFrame(() => this.spinGlobe());
        }
    }
}