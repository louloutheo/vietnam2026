import { tripDays } from "./data/content.js";
import { initMap, showTripView, focusVietnam, flyToPlace, flyToDay, locateMe } from "./modules/map.js";
import { renderDayCarousel, renderMapHome, renderPlaceDetail, renderPlanning, renderBudget } from "./modules/ui.js";

const state = {
  tab: "map",
  selectedPlace: null,
  selectedDayIndex: 0
};

const dayCarousel = document.getElementById("day-carousel");
const panel = document.getElementById("panel");
const panelContent = document.getElementById("panel-content");
const panelTitle = document.getElementById("panel-title");
const panelKicker = document.getElementById("panel-kicker");
const closeBtn = document.getElementById("btn-panel-close");
const dockItems = Array.from(document.querySelectorAll(".dock__item"));

initMap("map", {
  onPlaceSelect: handlePlaceSelect,
  onDaySelect: handleDaySelectFromMap
});

renderDayCarousel(dayCarousel, state.selectedDayIndex, handleDaySelect);
renderCurrentView();
startClock();

document.getElementById("btn-locate")?.addEventListener("click", () => {
  locateMe();
});

closeBtn?.addEventListener("click", () => {
  state.selectedPlace = null;
  renderCurrentView();
});

dockItems.forEach((item) => {
  item.addEventListener("click", () => {
    state.tab = item.dataset.tab;
    state.selectedPlace = null;
    updateDock();
    renderCurrentView();
  });
});

function updateDock() {
  dockItems.forEach((item) => {
    item.classList.toggle("dock__item--active", item.dataset.tab === state.tab);
  });
}

function handleDaySelect(index) {
  state.selectedDayIndex = index;
  state.selectedPlace = null;
  renderDayCarousel(dayCarousel, state.selectedDayIndex, handleDaySelect);

  if (state.tab === "planning") {
    renderCurrentView();
    flyToDay(tripDays[index]);
    return;
  }

  state.tab = "planning";
  updateDock();
  renderCurrentView();
  flyToDay(tripDays[index]);
}

function handleDaySelectFromMap(index) {
  state.selectedDayIndex = index;
  state.tab = "planning";
  state.selectedPlace = null;
  updateDock();
  renderDayCarousel(dayCarousel, state.selectedDayIndex, handleDaySelect);
  renderCurrentView();
}

function handlePlaceSelect(place) {
  state.selectedPlace = place;
  state.tab = "map";
  updateDock();
  renderCurrentView();
  flyToPlace(place);
}

function renderCurrentView() {
  closeBtn?.classList.add("hidden");

  if (state.tab === "map") {
    if (state.selectedPlace) {
      panelKicker.textContent = state.selectedPlace.dayId;
      panelTitle.textContent = state.selectedPlace.name;
      closeBtn?.classList.remove("hidden");

      renderPlaceDetail(panelContent, state.selectedPlace, () => {
        state.selectedPlace = null;
        renderCurrentView();
      });
    } else {
      panelKicker.textContent = "Carte";
      panelTitle.textContent = "Vue voyage";
      renderMapHome(panelContent, handlePlaceSelect, () => {
        focusVietnam();
      });
      showTripView();
    }
    return;
  }

  if (state.tab === "planning") {
    const currentDay = tripDays[state.selectedDayIndex];
    panelKicker.textContent = currentDay.date;
    panelTitle.textContent = `${currentDay.id} · ${currentDay.city}`;
    renderPlanning(panelContent, state.selectedDayIndex, handleDaySelect, handlePlaceSelect);
    flyToDay(currentDay);
    return;
  }

  if (state.tab === "budget") {
    panelKicker.textContent = "Budget";
    panelTitle.textContent = "Budget fun";
    renderBudget(panelContent);
    focusVietnam();
  }
}

function startClock() {
  updateClock();
  setInterval(updateClock, 1000);
}

function updateClock() {
  const vn = document.getElementById("time-vn");
  const fr = document.getElementById("time-fr");

  if (vn) {
    vn.textContent = new Date().toLocaleTimeString("fr-FR", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  if (fr) {
    fr.textContent = new Date().toLocaleTimeString("fr-FR", {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
}
