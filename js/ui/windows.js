const DESKTOP_BREAKPOINT = 768;
const WINDOW_STATE = new WeakMap();

function isDesktop() { return window.innerWidth >= DESKTOP_BREAKPOINT; }
function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

function bringToFront(el) {
  const views = document.querySelectorAll('.app-view');
  let maxZ = 30;
  views.forEach((view) => {
    const z = parseInt(window.getComputedStyle(view).zIndex || '30', 10);
    if (z > maxZ) maxZ = z;
  });
  el.style.zIndex = String(maxZ + 1);
}

function setDesktopDefaultPosition(el, index = 0) {
  const presets = [
    { top: 120, left: 70, width: 520, height: 620 },
    { top: 140, left: 110, width: 500, height: 600 },
    { top: 160, left: 150, width: 500, height: 600 }
  ];
  const preset = presets[index] || presets[0];
  el.style.left = `${preset.left}px`;
  el.style.top = `${preset.top}px`;
  el.style.width = `${preset.width}px`;
  el.style.height = `${preset.height}px`;
  el.style.transform = 'translate3d(0,0,0)';
}

function setMobileWindowStyle(el) {
  el.style.top = '8%';
  el.style.left = '5%';
  el.style.width = '90%';
  el.style.height = '62vh';
  el.style.transform = 'translate3d(0,0,0)';
  el.style.zIndex = '30';
}

function keepWindowInBounds(el) {
  const rect = el.getBoundingClientRect();
  const margin = 12;
  const maxLeft = window.innerWidth - rect.width - margin;
  const maxTop = window.innerHeight - rect.height - margin;
  const safeLeft = clamp(rect.left, margin, Math.max(margin, maxLeft));
  const safeTop = clamp(rect.top, margin, Math.max(margin, maxTop));
  el.style.left = `${safeLeft}px`;
  el.style.top = `${safeTop}px`;
  el.style.transform = 'translate3d(0,0,0)';
}

function attachWindowInteractions(el) {
  const header = el.querySelector('.window-header');
  const resizer = el.querySelector('.window-resizer');
  if (!header || !resizer) return;

  const state = {
    mode: null,
    activePointerId: null,
    startPointerX: 0,
    startPointerY: 0,
    baseLeft: 0,
    baseTop: 0,
    startWidth: 0,
    startHeight: 0,
    aspectRatio: 1,
    pendingDx: 0,
    pendingDy: 0,
    rafId: null
  };
  WINDOW_STATE.set(el, state);

  function renderFrame() {
    state.rafId = null;
    if (state.mode === 'drag') {
      el.style.transform = `translate3d(${state.pendingDx}px, ${state.pendingDy}px, 0)`;
    }
    if (state.mode === 'resize') {
      const nextWidth = Math.max(360, state.startWidth + state.pendingDx);
      const nextHeight = Math.max(420, nextWidth / state.aspectRatio);
      el.style.width = `${nextWidth}px`;
      el.style.height = `${nextHeight}px`;
    }
  }

  function queueRender() {
    if (state.rafId !== null) return;
    state.rafId = requestAnimationFrame(renderFrame);
  }

  function onPointerMove(event) {
    if (!isDesktop()) return;
    if (event.pointerId !== state.activePointerId) return;
    state.pendingDx = event.clientX - state.startPointerX;
    state.pendingDy = event.clientY - state.startPointerY;
    queueRender();
  }

  function stopInteraction(event) {
    if (event.pointerId !== state.activePointerId) return;
    if (state.rafId !== null) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    if (state.mode === 'drag') {
      const finalLeft = state.baseLeft + state.pendingDx;
      const finalTop = state.baseTop + state.pendingDy;
      el.style.left = `${finalLeft}px`;
      el.style.top = `${finalTop}px`;
      el.style.transform = 'translate3d(0,0,0)';
      keepWindowInBounds(el);
    }
    if (state.mode === 'resize') {
      keepWindowInBounds(el);
    }
    try { if (header.hasPointerCapture(event.pointerId)) header.releasePointerCapture(event.pointerId); } catch {}
    try { if (resizer.hasPointerCapture(event.pointerId)) resizer.releasePointerCapture(event.pointerId); } catch {}
    state.mode = null;
    state.activePointerId = null;
    state.pendingDx = 0;
    state.pendingDy = 0;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', stopInteraction);
    document.removeEventListener('pointercancel', stopInteraction);
  }

  header.addEventListener('pointerdown', (event) => {
    if (!isDesktop()) return;
    event.preventDefault();
    event.stopPropagation();
    state.mode = 'drag';
    state.activePointerId = event.pointerId;
    state.startPointerX = event.clientX;
    state.startPointerY = event.clientY;
    state.baseLeft = parseFloat(el.style.left || '0');
    state.baseTop = parseFloat(el.style.top || '0');
    state.pendingDx = 0;
    state.pendingDy = 0;
    bringToFront(el);
    try { header.setPointerCapture(event.pointerId); } catch {}
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', stopInteraction);
    document.addEventListener('pointercancel', stopInteraction);
  });

  resizer.addEventListener('pointerdown', (event) => {
    if (!isDesktop()) return;
    event.preventDefault();
    event.stopPropagation();
    state.mode = 'resize';
    state.activePointerId = event.pointerId;
    state.startPointerX = event.clientX;
    state.startPointerY = event.clientY;
    state.startWidth = el.offsetWidth;
    state.startHeight = el.offsetHeight;
    state.aspectRatio = state.startWidth / state.startHeight;
    state.pendingDx = 0;
    state.pendingDy = 0;
    bringToFront(el);
    try { resizer.setPointerCapture(event.pointerId); } catch {}
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', stopInteraction);
    document.addEventListener('pointercancel', stopInteraction);
  });

  el.addEventListener('pointerdown', () => { if (isDesktop()) bringToFront(el); });
}

export function initWindows() {
  Array.from(document.querySelectorAll('.app-view')).forEach((view, index) => {
    if (isDesktop()) setDesktopDefaultPosition(view, index);
    else setMobileWindowStyle(view);
    attachWindowInteractions(view);
  });
}

export function refreshWindowsLayout() {
  Array.from(document.querySelectorAll('.app-view')).forEach((view, index) => {
    if (isDesktop()) {
      if (!view.style.width || view.style.width.includes('%')) setDesktopDefaultPosition(view, index);
      keepWindowInBounds(view);
    } else setMobileWindowStyle(view);
  });
}
