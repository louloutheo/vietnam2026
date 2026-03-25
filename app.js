import { tripDays } from "./data/content.js";
import { initMap, showTripView, focusVietnam, flyToPlace, flyToDay, locateMe } from "./modules/map.js";
import { renderDayCarousel, renderMapHome, renderPlaceDetail, renderPlanning, renderBudget } from "./modules/ui.js";

const TRIP_START = new Date("2026-04-13T00:00:00");
const TRIP_END = new Date("2026-04-27T23:59:59");

const state = {
  tab: "map",
  selectedPlace: null,
  selectedDayIndex: getInitialDayIndex()
};

const dayCarousel = document.getElementById("day-carousel");
const panel = document.getElementById("panel");
const panelContent = document.getElementById("panel-content");
const panelTitle = document.getElementById("panel-title");
const panelKicker = document.getElementById("panel-kicker");
const closeBtn = document.getElementById("btn-panel-close");
const dockItems = Array.from(document.querySelectorAll(".dock__item"));
const prevDaysBtn = document.getElementById("days-prev");
const nextDaysBtn = document.getElementById("days-next");
const panelGrab = document.querySelector(".panel__grab");
const panelResizer = document.getElementById("panel-resizer");

initMap("map", {
  onPlaceSelect: handlePlaceSelect,
  onDaySelect: handleDaySelectFromMap
});

renderDayCarousel(dayCarousel, state.selectedDayIndex, handleDaySelect);
centerActiveDayPill();
renderCurrentView();
startClock();
setupDayRail();
setupDesktopPanelResize();
setupDesktopPanelDrag();

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

window.addEventListener("resize", () => {
  centerActiveDayPill(false);
});

function getInitialDayIndex() {
  const now = new Date();

  if (now < TRIP_START) {
    return 0;
  }

  if (now > TRIP_END) {
    return tripDays.length - 1;
  }

  const diffMs = now.getTime() - TRIP_START.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const foundIndex = tripDays.findIndex((day) => day.dayNumber === diffDays + 1);
  return foundIndex >= 0 ? foundIndex : 0;
}

function updateDock() {
  dockItems.forEach((item) => {
    item.classList.toggle("dock__item--active", item.dataset.tab === state.tab);
  });
}

function rerenderDays() {
  renderDayCarousel(dayCarousel, state.selectedDayIndex, handleDaySelect);
  centerActiveDayPill();
}

function centerActiveDayPill(smooth = true) {
  const active = dayCarousel.querySelector(".day-pill--active");
  if (!active) return;

  const containerWidth = dayCarousel.clientWidth;
  const targetLeft = active.offsetLeft - (containerWidth / 2) + (active.offsetWidth / 2);

  dayCarousel.scrollTo({
    left: Math.max(0, targetLeft),
    behavior: smooth ? "smooth" : "auto"
  });
}

function handleDaySelect(index) {
  state.selectedDayIndex = index;
  state.selectedPlace = null;
  rerenderDays();

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
  rerenderDays();
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
      const currentDay = tripDays[state.selectedDayIndex];
      panelKicker.textContent = currentDay?.date || "Carte";
      panelTitle.textContent = currentDay
        ? `${currentDay.id} · ${currentDay.city}`
        : "Vue voyage";

      renderMapHome(panelContent, handlePlaceSelect, () => {
        focusVietnam();
      });

      if (new Date() < TRIP_START) {
        showTripView();
      } else {
        flyToDay(currentDay);
      }
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

function setupDayRail() {
  prevDaysBtn?.addEventListener("click", () => {
    dayCarousel.scrollBy({ left: -220, behavior: "smooth" });
  });

  nextDaysBtn?.addEventListener("click", () => {
    dayCarousel.scrollBy({ left: 220, behavior: "smooth" });
  });
}

function setupDesktopPanelResize() {
  if (!panelResizer) return;

  let isResizing = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  const onMove = (event) => {
    if (!isResizing) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    const nextWidth = Math.min(Math.max(startWidth + dx, 320), window.innerWidth * 0.62);
    const nextHeight = Math.min(Math.max(startHeight + dy, 340), window.innerHeight - 210);

    panel.style.width = `${nextWidth}px`;
    panel.style.height = `${nextHeight}px`;
  };

  const stop = () => {
    isResizing = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", stop);
  };

  panelResizer.addEventListener("mousedown", (event) => {
    if (window.innerWidth < 900) return;

    event.preventDefault();
    isResizing = true;
    startX = event.clientX;
    startY = event.clientY;
    startWidth = panel.offsetWidth;
    startHeight = panel.offsetHeight;

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", stop);
  });
}

function setupDesktopPanelDrag() {
  if (!panelGrab) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  const onMove = (event) => {
    if (!isDragging) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    const nextLeft = Math.max(12, startLeft + dx);
    const nextTop = Math.max(12, startTop + dy);

    panel.style.left = `${nextLeft}px`;
    panel.style.top = `${nextTop}px`;
    panel.style.bottom = "auto";
  };

  const stop = () => {
    isDragging = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", stop);
  };

  panelGrab.addEventListener("mousedown", (event) => {
    if (window.innerWidth < 900) return;

    event.preventDefault();
    isDragging = true;

    const rect = panel.getBoundingClientRect();
    startX = event.clientX;
    startY = event.clientY;
    startLeft = rect.left;
    startTop = rect.top;

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", stop);
  });
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