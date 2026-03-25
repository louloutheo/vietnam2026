export class GlobeEngine {
    constructor(containerId) {
        this.map = new maplibregl.Map({
            container: containerId,
            style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json', 
            center: [105.85, 21.02],
            zoom: 1.5,
            pitch: 30,
            projection: { type: 'globe' } 
        });

        this.map.on('load', () => {
            this.spinGlobe();
        });
    }

    spinGlobe() {
        const zoom = this.map.getZoom();
        if (zoom < 3) {
            let center = this.map.getCenter();
            center.lng += 0.2;
            this.map.easeTo({ center, duration: 1000, easing: (n) => n });
            
            requestAnimationFrame(() => this.spinGlobe());
        }
    }
}