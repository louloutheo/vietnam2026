export const initGlobe = () => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2ltYW90aGVvNjQiLCJhIjoiY21uNGh0c25yMDBhdzJyc2NoMmxmaWR6OCJ9.G1w0xhZMfmz4rTISLA7iTA';

    const map = new mapboxgl.Map({
        container: 'map-container',
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: 'globe', // Exigence CART-01
        zoom: 1.5,
        center: [105.8, 21.0], // Vietnam
        pitch: 0,
        antialias: true
    });

    map.on('style.load', () => {
        // Exigence CART-05 : Halo atmosphérique
        map.setFog({
            'color': 'rgb(186, 210, 235)',
            'high-color': 'rgb(36, 92, 223)',
            'horizon-blend': 0.02,
            'space-color': 'rgb(11, 11, 25)',
            'star-intensity': 0.6
        });
    });

    return map;
};