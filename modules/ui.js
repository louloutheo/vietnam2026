import { tripDays, places, budgetBlocks } from "../data/content.js";
import { googleMapsSearchUrl, googleMapsDirectionsUrl } from "./googleMaps.js";

export function renderDayCarousel(container, activeIndex, onSelect) {
  container.innerHTML = "";

  tripDays.forEach((day, index) => {
    const btn = document.createElement("button");
    btn.className = `day-pill${index === activeIndex ? " day-pill--active" : ""}`;
    btn.innerHTML = `<span>${day.id}</span><span>${day.city.toUpperCase()}</span>`;
    btn.addEventListener("click", () => onSelect(index));
    container.appendChild(btn);
  });

  const active = container.querySelector(".day-pill--active");
  active?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
}

export function renderMapHome(container, onOpenPlace, onZoomVietnam) {
  container.innerHTML = "";

  const stack = document.createElement("div");
  stack.className = "stack";

  const intro = document.createElement("article");
  intro.className = "card";
  intro.innerHTML = `
    <p class="section-title">Vue voyage</p>
    <h3>Le trajet au global</h3>
    <p>On garde une vision propre du voyage, puis on zoome sur les étapes quand il faut.</p>
    <div class="actions">
      <button class="btn btn--primary js-vietnam">Zoom Vietnam</button>
    </div>
  `;
  intro.querySelector(".js-vietnam")?.addEventListener("click", onZoomVietnam);

  const list = document.createElement("div");
  list.className = "place-list";

  places.forEach((place) => {
    const card = document.createElement("article");
    card.className = "place-card";
    card.innerHTML = `
      <div class="place-card__meta">
        <span class="kv">${place.dayId} · ${place.category}</span>
      </div>
      <h3>${place.name}</h3>
      <p>${place.city}</p>
      <p>${place.description}</p>
      <div class="actions">
        <button class="btn btn--primary js-open">Ouvrir</button>
        <a class="btn" href="${googleMapsSearchUrl(place.mapQuery)}" target="_blank" rel="noreferrer">Google Maps</a>
      </div>
    `;
    card.querySelector(".js-open")?.addEventListener("click", () => onOpenPlace(place));
    list.appendChild(card);
  });

  stack.appendChild(intro);
  stack.appendChild(list);
  container.appendChild(stack);
}

export function renderPlaceDetail(container, place, onBack) {
  container.innerHTML = `
    <article class="place-card">
      <div class="place-card__meta">
        <span class="kv">${place.dayId} · ${place.category}</span>
      </div>
      <h3>${place.name}</h3>
      <p>${place.city}</p>
      <p>${place.description}</p>
      <div class="actions">
        <button class="btn btn--primary js-back">Retour</button>
        <a class="btn" href="${googleMapsSearchUrl(place.mapQuery)}" target="_blank" rel="noreferrer">Voir</a>
        <a class="btn" href="${googleMapsDirectionsUrl(place.mapQuery)}" target="_blank" rel="noreferrer">Y aller</a>
      </div>
    </article>
  `;

  container.querySelector(".js-back")?.addEventListener("click", onBack);
}

export function renderPlanning(container, activeIndex, onSelectDay, onOpenPlaceForDay) {
  container.innerHTML = "";

  const day = tripDays[activeIndex];
  const linkedPlace = places.find((place) => place.dayId === day.id);

  const stack = document.createElement("div");
  stack.className = "stack";

  const headerCard = document.createElement("article");
  headerCard.className = "card";
  headerCard.innerHTML = `
    <p class="section-title">${day.date}</p>
    <h3>${day.id} · ${day.city}</h3>
    <p>${day.subtitle}</p>
    <div class="actions">
      <button class="btn js-prev">Jour précédent</button>
      <button class="btn js-next">Jour suivant</button>
    </div>
  `;

  headerCard.querySelector(".js-prev")?.addEventListener("click", () => {
    onSelectDay(Math.max(0, activeIndex - 1));
  });

  headerCard.querySelector(".js-next")?.addEventListener("click", () => {
    onSelectDay(Math.min(tripDays.length - 1, activeIndex + 1));
  });

  const timelineCard = document.createElement("article");
  timelineCard.className = "card";

  let timelineHtml = `<p class="section-title">Déroulé</p><div class="timeline">`;

  if (day.transport) {
    timelineHtml += `
      <div class="timeline-item timeline-item--transport">
        <div class="timeline-head"><strong>Transport</strong></div>
        <p>${day.transport}</p>
      </div>
    `;
  }

  if (day.stay) {
    timelineHtml += `
      <div class="timeline-item timeline-item--stay">
        <div class="timeline-head"><strong>Logement</strong></div>
        <p>${day.stay}</p>
      </div>
    `;
  }

  day.activities.forEach((activity) => {
    timelineHtml += `
      <div class="timeline-item">
        <div class="timeline-head"><strong>${activity.name}</strong></div>
        <p>${day.city}</p>
      </div>
    `;
  });

  if (day.alerts.length) {
    day.alerts.forEach((alert) => {
      timelineHtml += `
        <div class="timeline-item timeline-item--alert">
          <div class="timeline-head"><strong>Rappel</strong></div>
          <p>${alert}</p>
        </div>
      `;
    });
  }

  timelineHtml += `</div>`;
  timelineCard.innerHTML = timelineHtml;

  stack.appendChild(headerCard);
  stack.appendChild(timelineCard);

  if (linkedPlace) {
    const linkedCard = document.createElement("article");
    linkedCard.className = "card";
    linkedCard.innerHTML = `
      <p class="section-title">Étape liée</p>
      <h3>${linkedPlace.name}</h3>
      <p>${linkedPlace.description}</p>
      <div class="actions">
        <button class="btn btn--primary js-open-place">Voir sur la carte</button>
      </div>
    `;
    linkedCard.querySelector(".js-open-place")?.addEventListener("click", () => onOpenPlaceForDay(linkedPlace));
    stack.appendChild(linkedCard);
  }

  container.appendChild(stack);
}

export function renderBudget(container) {
  container.innerHTML = "";

  const stack = document.createElement("div");
  stack.className = "stack";

  const intro = document.createElement("article");
  intro.className = "card";
  intro.innerHTML = `
    <p class="section-title">Budget fun</p>
    <h3>Pas de flicage</h3>
    <p>On garde juste des repères cool pour ne pas se faire surprendre.</p>
  `;
  stack.appendChild(intro);

  const grid = document.createElement("div");
  grid.className = "budget-grid";

  budgetBlocks.forEach((block) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <p class="section-title">${block.value}</p>
      <h3>${block.title}</h3>
      <p>${block.text}</p>
    `;
    grid.appendChild(card);
  });

  stack.appendChild(grid);

  const tip = document.createElement("article");
  tip.className = "card";
  tip.innerHTML = `
    <p class="section-title">Mémo</p>
    <h3>Esprit du budget</h3>
    <p>On veut un outil léger, complice et utile sur place. Pas une appli bancaire qui juge tout.</p>
  `;
  stack.appendChild(tip);

  container.appendChild(stack);
}
