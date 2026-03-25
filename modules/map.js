import { MAPBOX_TOKEN } from "./config.js";
import { activities } from "../data/activities.js";
import { googleMapsSearchUrl, googleMapsDirectionsUrl } from "./googleMaps.js";

let map;
let userMarker;
let markers = [];

export function initMap(containerId) {
  mapboxgl.accessToken = MAPBOX_TOKEN;

  map = new mapboxgl.Map({
    container: containerId,
    style: "mapbox://styles/mapbox/standard",
    center: [106.2, 16.2],
    zoom: 4.7,
    pitch: 42,
    bearing: 0,
    projection: "globe"
  });

  map.addControl(new mapboxgl.NavigationControl(), "top-right");

  map.on("style.load", () => {
    map.setFog({
      color: "rgb(10, 17, 28)",
      "high-color": "rgb(36, 92, 223)",
      "horizon-blend": 0.08,
      "space-color": "rgb(1, 1, 1)",
      "star-intensity": 0.15
    });

    map.setConfigProperty("basemap", "lightPreset", "day");
    map.setConfigProperty("basemap", "showPointOfInterestLabels", true);
    map.setConfigProperty("basemap", "showTransitLabels", true);
    map.setConfigProperty("basemap", "showRoadLabels", true);
  });

  map.on("load", () => {
    addActivityMarkers();
    fitVietnam();
  });

  return map;
}

function addActivityMarkers() {
  clearMarkers();

  for (const activity of activities) {
    const [lng, lat] = activity.coordinates;

    const popupHtml = `
      <div>
        <h3>${activity.name}</h3>
        <p><strong>${activity.city}</strong><br>${activity.description}</p>
        <div class="popup-actions">
          <a class="popup-link" href="${googleMapsSearchUrl(lat, lng)}" target="_blank" rel="noreferrer">Voir</a>
          <a class="popup-link" href="${googleMapsDirectionsUrl(lat, lng)}" target="_blank" rel="noreferrer">Y aller</a>
        </div>
      </div>
    `;

    const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(popupHtml);

    const marker = new mapboxgl.Marker({ color: "#ff7b54" })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    marker.getElement().addEventListener("dblclick", (event) => {
      event.preventDefault();
      window.open(googleMapsSearchUrl(lat, lng), "_blank", "noopener,noreferrer");
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

export function setPreset(preset) {
  if (!map) return;
  map.setConfigProperty("basemap", "lightPreset", preset);
}

export function fitVietnam() {
  if (!map) return;

  map.flyTo({
    center: [106.2, 16.2],
    zoom: 4.7,
    pitch: 42,
    bearing: 0,
    duration: 1800,
    essential: true
  });
}

export function showGlobe() {
  if (!map) return;

  map.flyTo({
    center: [105, 16],
    zoom: 1.6,
    pitch: 20,
    bearing: 0,
    duration: 1800,
    essential: true
  });
}

export function flyToActivity(coordinates) {
  if (!map) return;

  map.flyTo({
    center: coordinates,
    zoom: 15,
    pitch: 58,
    bearing: 18,
    duration: 1800,
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
        zoom: 14.5,
        pitch: 55,
        bearing: 12,
        duration: 1800,
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
