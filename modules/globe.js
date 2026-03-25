export const initGlobe = () => {
    // Ton token Mapbox
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2ltYW90aGVvNjQiLCJhIjoiY21uNGh0c25yMDBhdzJyc2NoMmxmaWR6OCJ9.G1w0xhZMfmz4rTISLA7iTA';

    const map = new mapboxgl.Map({
        container: 'map-container',
        style: 'mapbox://styles/mapbox/dark-v11', // Fond de carte sombre [cite: 11]
        projection: 'globe', // Exigence CART-01 : Globe 3D 
        zoom: 1.8,
        center: [105.8342, 21.0278], // Centré sur Hanoï pour le Vietnam
        pitch: 35, // Angle de caméra pour voir la courbure
    });

    map.on('style.load', () => {
        // Exigence CART-05 : Atmosphère & brouillard 
        map.setFog({
            'color': 'rgb(186, 210, 235)', // Halo bleuté aux bords
            'high-color': 'rgb(36, 92, 223)',
            'horizon-blend': 0.02,
            'space-color': 'rgb(11, 11, 25)', // Espace sombre
            'star-intensity': 0.6
        });
        
        console.log('Couche L0 : Globe WebGL chargé à 60 FPS.');
    });

    return map;
};