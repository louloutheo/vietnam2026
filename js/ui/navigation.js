export function initNavigation() {
  const views = [
    document.getElementById("view-etapes"),
    document.getElementById("view-budget"),
    document.getElementById("view-vault")
  ];

  const navItems = Array.from(document.querySelectorAll(".nav-item"));
  let currentTarget = "view-etapes";

  function hideAllViews() {
    views.forEach((view) => view?.classList.remove("is-visible"));
  }

  function deactivateAllTabs() {
    navItems.forEach((item) => item.classList.remove("active"));
  }

  function openView(targetId) {
    currentTarget = targetId;
    hideAllViews();
    deactivateAllTabs();

    if (targetId !== "none") {
      const target = document.getElementById(targetId);
      if (target) target.classList.add("is-visible");
    }

    const activeTab = navItems.find((item) => item.dataset.target === targetId);
    if (activeTab) activeTab.classList.add("active");
  }

  navItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const targetId = item.dataset.target;

      if (targetId === currentTarget && targetId !== "none") {
        openView("none");
        return;
      }

      openView(targetId);
    });
  });

  openView("view-etapes");

  return {
    openView,
    getCurrentTarget: () => currentTarget
  };
}