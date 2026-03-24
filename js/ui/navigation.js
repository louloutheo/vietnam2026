import { state } from "../state.js";

export function initNavigation() {
  const views = [document.getElementById("view-etapes"), document.getElementById("view-budget"), document.getElementById("view-vault")];
  const navItems = Array.from(document.querySelectorAll(".nav-item"));

  function hideAllViews() { views.forEach(v => v?.classList.remove("is-visible")); }
  function deactivateAllTabs() { navItems.forEach(i => i.classList.remove("active")); }

  function openView(targetId) {
    state.navigation.currentTarget = targetId;
    hideAllViews();
    deactivateAllTabs();
    if (targetId !== "none") document.getElementById(targetId)?.classList.add("is-visible");
    navItems.find(i => i.dataset.target === targetId)?.classList.add("active");
  }

  navItems.forEach(item => item.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const targetId = item.dataset.target;
    if (targetId === state.navigation.currentTarget && targetId !== "none") {
      openView("none");
      return;
    }
    openView(targetId);
  }));

  openView("view-etapes");
  return { openView };
}
