import { activities } from "../data/activities.js";
import { flyToActivity } from "./map.js";
import { googleMapsSearchUrl, googleMapsDirectionsUrl } from "./googleMaps.js";

export function renderActivities(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  for (const activity of activities) {
    const [lng, lat] = activity.coordinates;

    const card = document.createElement("article");
    card.className = "activity";

    card.innerHTML = `
      <h3>${activity.name}</h3>
      <p class="city">${activity.city}</p>
      <p>${activity.description}</p>
      <div class="activity__actions">
        <button class="btn js-zoom">Zoom</button>
        <a class="btn" href="${googleMapsSearchUrl(lat, lng)}" target="_blank" rel="noreferrer">Google Maps</a>
        <a class="btn" href="${googleMapsDirectionsUrl(lat, lng)}" target="_blank" rel="noreferrer">Itinéraire</a>
      </div>
    `;

    card.querySelector(".js-zoom")?.addEventListener("click", () => {
      flyToActivity([lng, lat]);
    });

    container.appendChild(card);
  }
}
