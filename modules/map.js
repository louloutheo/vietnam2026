import { MAPBOX_TOKEN } from "./config.js";
import { places } from "../data/content.js";
import { googleMapsSearchUrl, googleMapsDirectionsUrl } from "./googleMaps.js";

let map;
let userMarker;
let markers = [];
let onPlaceSelect = null;

export function initMap(containerId, placeSelectCallback) {
  onPlaceSelect = placeSelectCallback;
  mapboxgl.accessToken = MAPBOX_TOKEN;

  map = new mapboxgl.Map({
    container: containerId,
    style: "mapbox://styles/mapbox/standard-satellite",
    center: [88, 28],
    zoom: 2.55,
    pitch: 0,
    bearing: 0,
    projection: "globe"
  });

  map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

  map.on("style.load", () => {
    map.setFog({
      color: "rgb(5, 10, 20)",
      "high-color": "rgb(12, 23, 44)",
      "horizon-blend": 0.05,
      "space-color": "rgb(1, 1, 1)",
      "star-intensity": 0.35
    });

    map.setConfigProperty("basemap", "lightPreset", "night");
    map.setConfigProperty("basemap", "showPointOfInterestLabels", true);
    map.setConfigProperty("basemap", "showRoadLabels", true);
    map.setConfigProperty("basemap", "showTransitLabels", false);
    map.setConfigProperty("basemap", "showPlaceLabels", true);
  });

  map.on("load", () => {
    addRoute();
    addPlaceMarkers();
    showTripView();
  });

  map.on("error", (event) => {
    console.error("Mapbox error:", event);
  });

  return map;
}

function addRoute() {
  const routeCoordinates = [
    [2.3522, 48.8566],
    [28.9784, 41.0082],
    [105.8412, 21.0282],
    [105.8861, 20.2563],
    [108.3287, 15.8801],
    [106.6990, 10.7798]
  ];

  if (map.getSource("route-line")) return;

  map.addSource("route-line", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: routeCoordinates
      }
    }
  });

  map.addLayer({
    id: "route-line-layer",
    type: "line",
    source: "route-line",
    paint: {
      "line-color": "#26e2b3",
      "line-width": 3,
      "line-opacity": 0.9,
      "line-dasharray": [2, 2]
    }
  });

  const hubs = [
    { name: "Paris", coordinates: [2.3522, 48.8566] },
    { name: "Istanbul", coordinates: [28.9784, 41.0082] }
  ];

  for (const hub of hubs) {
    const popup = new mapboxgl.Popup({ offset: 14 }).setHTML(`
      <div>
        <h3>${hub.name}</h3>
        <p>Point de passage du trajet.</p>
      </div>
    `);

    new mapboxgl.Marker({ color: "#ffffff" })
      .setLngLat(hub.coordinates)
      .setPopup(popup)
      .addTo(map);
  }
}

function addPlaceMarkers() {
  clearMarkers();

  for (const place of places) {
    const [lng, lat] = place.coordinates;

    const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(`
      <div>
        <h3>${place.name}</h3>
        <p><strong>${place.city}</strong><br>${place.description}</p>
        <div class="popup-actions">
          <a class="popup-link" href="${googleMapsSearchUrl(lat, lng)}" target="_blank" rel="noreferrer">Voir</a>
          <a class="popup-link" href="${googleMapsDirectionsUrl(lat, lng)}" target="_blank" rel="noreferrer">Y aller</a>
        </div>
      </div>
    `);

    const marker = new mapboxgl.Marker({ color: "#9fffe4" })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    marker.getElement().addEventListener("click", () => {
      onPlaceSelect?.(place);
    });

    markers.push(marker);
  }
}

function clearMarkers() {
  for (const marker of markers) {
    marker.remove();
  }
  markers = [];
}

export function showTripView() {
  if (!map) return;

  map.flyTo({
    center: [82, 26],
    zoom: 2.55,
    pitch: 0,
    bearing: 0,
    duration: 1800,
    essential: true
  });
}

export function focusVietnam() {
  if (!map) return;

  map.flyTo({
    center: [106.2, 16.2],
    zoom: 4.9,
    pitch: 18,
    bearing: 0,
    duration: 1600,
    essential: true
  });
}

export function flyToPlace(place) {
  if (!map || !place) return;

  map.flyTo({
    center: place.coordinates,
    zoom: 13.8,
    pitch: 52,
    bearing: 16,
    duration: 1600,
    essential: true
  });
}

export function locateMe() {
  if (!navigator.geolocation || !map) return;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lng = position.coords.longitude;
      const lat = position.coords.latitude;

      if (!userMarker) {
        const el = document.createElement("div");
        el.className = "user-dot";

        userMarker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map);
      } else {
        userMarker.setLngLat([lng, lat]);
      }

      map.flyTo({
        center: [lng, lat],
        zoom: 14.8,
        pitch: 48,
        bearing: 10,
        duration: 1600,
        essential: true
      });
    },
    (error) => {
      console.error("Erreur géolocalisation :", error);
      alert("Impossible d'accéder à ta position.");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}
