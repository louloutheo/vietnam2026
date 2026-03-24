const DESKTOP_BREAKPOINT = 768;

function isDesktop() {
  return window.innerWidth >= DESKTOP_BREAKPOINT;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function bringToFront(el) {
  const views = document.querySelectorAll(".app-view");
  let maxZ = 30;

  views.forEach((view) => {
    const z = parseInt(window.getComputedStyle(view).zIndex || "30", 10);
    if (z > maxZ) maxZ = z;
  });

  el.style.zIndex = String(maxZ + 1);
}

function setDesktopDefaultPosition(el, index = 0) {
  const presets = [
    { top: 140, left: 70, width: 460, height: 560 },
    { top: 150, left: 110, width: 430, height: 560 },
    { top: 160, left: 150, width: 430, height: 560 }
  ];

  const preset = presets[index] || presets[0];
  el.style.top = `${preset.top}px`;
  el.style.left = `${preset.left}px`;
  el.style.width = `${preset.width}px`;
  el.style.height = `${preset.height}px`;
}

function setMobileWindowStyle(el) {
  el.style.top = "8%";
  el.style.left = "5%";
  el.style.width = "90%";
  el.style.height = "62vh";
  el.style.zIndex = "30";
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
}

function attachWindowInteractions(el) {
  const header = el.querySelector(".window-header");
  const resizer = el.querySelector(".window-resizer");

  if (!header || !resizer) return;

  let dragging = false;
  let resizing = false;

  let dragOffsetX = 0;
  let dragOffsetY = 0;

  let startX = 0;
  let startWidth = 0;
  let startHeight = 0;
  let aspectRatio = 1;

  function onPointerMove(event) {
    if (!isDesktop()) return;

    if (dragging) {
      const nextLeft = event.clientX - dragOffsetX;
      const nextTop = event.clientY - dragOffsetY;

      el.style.left = `${nextLeft}px`;
      el.style.top = `${nextTop}px`;
      keepWindowInBounds(el);
    }

    if (resizing) {
      const dx = event.clientX - startX;
      const nextWidth = Math.max(320, startWidth + dx);
      const nextHeight = Math.max(360, nextWidth / aspectRatio);

      el.style.width = `${nextWidth}px`;
      el.style.height = `${nextHeight}px`;
      keepWindowInBounds(el);
    }
  }

  function stopInteraction() {
    dragging = false;
    resizing = false;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", stopInteraction);
  }

  header.addEventListener("pointerdown", (event) => {
    if (!isDesktop()) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = el.getBoundingClientRect();

    dragging = true;
    resizing = false;

    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;

    bringToFront(el);

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", stopInteraction);
  });

  resizer.addEventListener("pointerdown", (event) => {
    if (!isDesktop()) return;

    event.preventDefault();
    event.stopPropagation();

    resizing = true;
    dragging = false;

    startX = event.clientX;
    startWidth = el.offsetWidth;
    startHeight = el.offsetHeight;
    aspectRatio = startWidth / startHeight;

    bringToFront(el);

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", stopInteraction);
  });

  el.addEventListener("pointerdown", () => {
    if (!isDesktop()) return;
    bringToFront(el);
  });
}

export function initWindows() {
  const views = Array.from(document.querySelectorAll(".app-view"));

  views.forEach((view, index) => {
    if (isDesktop()) {
      setDesktopDefaultPosition(view, index);
    } else {
      setMobileWindowStyle(view);
    }

    attachWindowInteractions(view);
  });
}

export function refreshWindowsLayout() {
  const views = Array.from(document.querySelectorAll(".app-view"));

  views.forEach((view, index) => {
    if (isDesktop()) {
      if (!view.style.width || view.style.width.includes("%")) {
        setDesktopDefaultPosition(view, index);
      }
      keepWindowInBounds(view);
    } else {
      setMobileWindowStyle(view);
    }
  });
}