import { places, planningDays, budgetStats } from "../data/content.js";
import { googleMapsSearchUrl, googleMapsDirectionsUrl } from "./googleMaps.js";

export function renderMapHome(container, onSelectPlace, onFocusVietnam) {
  container.innerHTML = "";

  const section = document.createElement("div");
  section.className = "card-grid";

  const intro = document.createElement("article");
  intro.className = "mini-card";
  intro.innerHTML = `
    <p class="section-label">Vue voyage</p>
    <h3>Le trajet au global</h3>
    <p>On garde une vision propre du voyage, puis on zoome sur les étapes quand il faut.</p>
    <div class="actions">
      <button class="btn btn--primary js-focus-vietnam">Zoom Vietnam</button>
    </div>
  `;

  intro.querySelector(".js-focus-vietnam")?.addEventListener("click", onFocusVietnam);

  const list = document.createElement("div");
  list.className = "card-grid";

  for (const place of places) {
    const [lng, lat] = place.coordinates;

    const card = document.createElement("article");
    card.className = "place-card";
    card.innerHTML = `
      <p class="section-label">${place.day} · ${place.category}</p>
      <h3>${place.name}</h3>
      <p>${place.city}</p>
      <p>${place.description}</p>
      <div class="actions">
        <button class="btn btn--primary js-open">Ouvrir</button>
        <a class="btn btn--soft" href="${googleMapsSearchUrl(lat, lng)}" target="_blank" rel="noreferrer">Google Maps</a>
      </div>
    `;

    card.querySelector(".js-open")?.addEventListener("click", () => onSelectPlace(place));
    list.appendChild(card);
  }

  section.appendChild(intro);
  section.appendChild(list);
  container.appendChild(section);
}

export function renderPlaceDetail(container, place, onBack) {
  if (!place) return;

  const [lng, lat] = place.coordinates;

  container.innerHTML = `
    <article class="place-card">
      <p class="section-label">${place.day} · ${place.category}</p>
      <h3>${place.name}</h3>
      <p>${place.city}</p>
      <p>${place.description}</p>
      <div class="actions">
        <button class="btn btn--primary js-back">Retour carte</button>
        <a class="btn" href="${googleMapsSearchUrl(lat, lng)}" target="_blank" rel="noreferrer">Voir</a>
        <a class="btn" href="${googleMapsDirectionsUrl(lat, lng)}" target="_blank" rel="noreferrer">Y aller</a>
      </div>
    </article>
  `;

  container.querySelector(".js-back")?.addEventListener("click", onBack);
}

export function renderPlanning(container, onSelectDayPlace) {
  container.innerHTML = "";

  const strip = document.createElement("div");
  strip.className = "trip-strip";

  for (let i = 0; i < planningDays.length; i++) {
    const day = planningDays[i];
    const button = document.createElement("button");
    button.className = `trip-pill${i === 0 ? " trip-pill--active" : ""}`;
    button.textContent = day.title;
    strip.appendChild(button);
  }

  const list = document.createElement("div");
  list.className = "card-grid";

  for (const day of planningDays) {
    const relatedPlace = places.find((place) => place.day === day.id);

    const card = document.createElement("article");
    card.className = "day-card";
    card.innerHTML = `
      <p class="section-label">${day.id}</p>
      <h3>${day.title}</h3>
      <p class="meta">${day.subtitle}</p>
      <p>${day.note}</p>
      ${relatedPlace ? `<div class="actions"><button class="btn btn--primary js-place">Voir l'étape liée</button></div>` : ""}
    `;

    if (relatedPlace) {
      card.querySelector(".js-place")?.addEventListener("click", () => onSelectDayPlace(relatedPlace));
    }

    list.appendChild(card);
  }

  container.appendChild(strip);
  container.appendChild(list);
}

export function renderBudget(container) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "card-grid";

  const intro = document.createElement("article");
  intro.className = "budget-card";
  intro.innerHTML = `
    <p class="section-label">Budget fun</p>
    <h3>Pas de flicage</h3>
    <p>${budgetStats.vibe}</p>
  `;

  wrapper.appendChild(intro);

  for (const block of budgetStats.blocks) {
    const card = document.createElement("article");
    card.className = "budget-card";
    card.innerHTML = `
      <p class="section-label">${block.value}</p>
      <h3>${block.title}</h3>
      <p>${block.text}</p>
    `;
    wrapper.appendChild(card);
  }

  container.appendChild(wrapper);
}
