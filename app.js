import { initMap, setPreset, fitVietnam, showGlobe, locateMe } from "./modules/map.js";
import { renderActivities } from "./modules/ui.js";

initMap("map");
renderActivities("activities");

document.getElementById("btn-day")?.addEventListener("click", () => {
  setPreset("day");
});

document.getElementById("btn-night")?.addEventListener("click", () => {
  setPreset("night");
});

document.getElementById("btn-vietnam")?.addEventListener("click", () => {
  fitVietnam();
});

document.getElementById("btn-globe")?.addEventListener("click", () => {
  showGlobe();
});

document.getElementById("btn-locate")?.addEventListener("click", () => {
  locateMe();
});
