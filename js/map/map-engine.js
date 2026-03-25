import { initCesiumMap, flyToLocation, flyToUserLocation, resizeCesiumMap } from './map-cesium.js';
export const initMapEngine = (options = {}) => initCesiumMap(options);
export const mapFlyToLocation = (location) => flyToLocation(location);
export const mapFlyToUser = () => flyToUserLocation();
export const mapResize = () => resizeCesiumMap();
