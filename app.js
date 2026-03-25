import { initMap, showTripView, focusVietnam, flyToPlace, locateMe } from "./modules/map.js";
import { renderMapHome, renderPlaceDetail, renderPlanning, renderBudget } from "./modules/ui.js";

const state = {
  tab: "map",
  selectedPlace: null,
  sheetOpen: true
};

const sheet = document.getElementById("sheet");
const sheetContent = document.getElementById("sheet-content");
const sheetTitle = document.getElementById("sheet-title");
const sheetKicker = document.getElementById("sheet-kicker");
const closePlaceBtn = document.getElementById("btn-close-place");
const dockItems = Array.from(document.querySelectorAll(".dock__item"));

initMap("map", handlePlaceSelect);
renderCurrentTab();

document.getElementById("btn-locate")?.addEventListener("click", () => {
  locateMe();
});

document.getElementById("btn-sheet-toggle")?.addEventListener("click", () => {
  state.sheetOpen = !state.sheetOpen;
  sheet.classList.toggle("sheet--closed", !state.sheetOpen);
});

closePlaceBtn?.addEventListener("click", () => {
  state.selectedPlace = null;
  renderCurrentTab();
});

for (const item of dockItems) {
  item.addEventListener("click", () => {
    state.tab = item.dataset.tab;
    state.selectedPlace = null;
    updateDock();
    renderCurrentTab();
  });
}

function updateDock() {
  for (const item of dockItems) {
    item.classList.toggle("dock__item--active", item.dataset.tab === state.tab);
  }
}

function handlePlaceSelect(place) {
  state.tab = "map";
  state.selectedPlace = place;
  state.sheetOpen = true;
  sheet.classList.remove("sheet--closed");
  updateDock();
  renderCurrentTab();
  flyToPlace(place);
}

function renderCurrentTab() {
  closePlaceBtn?.classList.add("hidden");

  if (state.tab === "map") {
    if (state.selectedPlace) {
      sheetKicker.textContent = state.selectedPlace.day;
      sheetTitle.textContent = state.selectedPlace.name;
      closePlaceBtn?.classList.remove("hidden");
      renderPlaceDetail(sheetContent, state.selectedPlace, () => {
        state.selectedPlace = null;
        renderCurrentTab();
      });
    } else {
      sheetKicker.textContent = "Carte";
      sheetTitle.textContent = "Explorer le voyage";
      renderMapHome(sheetContent, handlePlaceSelect, () => {
        focusVietnam();
      });
      showTripView();
    }
    return;
  }

  if (state.tab === "planning") {
    sheetKicker.textContent = "Planning";
    sheetTitle.textContent = "Les étapes du voyage";
    renderPlanning(sheetContent, handlePlaceSelect);
    focusVietnam();
    return;
  }

  if (state.tab === "budget") {
    sheetKicker.textContent = "Budget";
    sheetTitle.textContent = "Budget fun";
    renderBudget(sheetContent);
    focusVietnam();
  }
}
