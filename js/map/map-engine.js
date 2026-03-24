import { initCesiumMap, flyToLocation, flyToUserLocation, resizeCesiumMap } from "./map-cesium.js";
export function initMapEngine(options={}){ return initCesiumMap(options); }
export function mapFlyToLocation(location){ flyToLocation(location); }
export function mapFlyToUser(){ flyToUserLocation(); }
export function mapResize(){ resizeCesiumMap(); }
