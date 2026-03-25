import { state } from '../state.js';

export function initNavigation() {
  const views = [
    document.getElementById('view-etapes'),
    document.getElementById('view-budget'),
    document.getElementById('view-vault')
  ];
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const carousel = document.getElementById('mini-nav-carousel');

  function hideAllViews() { views.forEach((view) => view?.classList.remove('is-visible')); }
  function deactivateAllTabs() { navItems.forEach((item) => item.classList.remove('active')); }

  function renderCarousel() {
    carousel.innerHTML = state.trip.map((day, index) => `<button class="carousel-pill ${index === state.currentDayIdx ? 'active' : ''}" data-day-pill="${index}">J${day.jour} · ${day.ville.split('->')[0].trim()}</button>`).join('');
    carousel.classList.toggle('hidden', state.navigation.currentTarget !== 'none');
    carousel.querySelectorAll('[data-day-pill]').forEach((pill) => pill.addEventListener('click', () => {
      state.currentDayIdx = Number(pill.dataset.dayPill);
      document.dispatchEvent(new CustomEvent('osultimate:daychange'));
    }));
  }

  function openView(targetId) {
    state.navigation.currentTarget = targetId;
    hideAllViews();
    deactivateAllTabs();
    if (targetId !== 'none') {
      const target = document.getElementById(targetId);
      if (target) target.classList.add('is-visible');
    }
    const activeTab = navItems.find((item) => item.dataset.target === targetId);
    if (activeTab) activeTab.classList.add('active');
    renderCarousel();
  }

  navItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const targetId = item.dataset.target;
      if (targetId === state.navigation.currentTarget && targetId !== 'none') {
        openView('none');
        return;
      }
      openView(targetId);
    });
  });

  document.addEventListener('osultimate:daychange', renderCarousel);
  openView('view-etapes');
  return { openView, renderCarousel };
}
