/**
 * ui-windows.js — Smart OS Windows Manager
 *
 * - Drag sur desktop (pointer events unifiés)
 * - Resize avec ratio bloqué
 * - Mobile : fenêtres centrées, drag/resize désactivés
 * - Isolation totale des events pour ne pas interférer avec Mapbox
 */

const MOBILE_BREAKPOINT = 768;
const MIN_SIZE = 280;

let activeWindows = new Set();

// ─── INIT ──────────────────────────────────────────────────────────────────

export function initWindows() {
    document.querySelectorAll('.os-window').forEach(win => {
        setupWindow(win);
        win.style.display = 'none'; // Caché par défaut
    });
}

function setupWindow(el) {
    const id = el.id;
    const header = el.querySelector('.window-header');
    const resizer = el.querySelector('.window-resizer');

    // Position initiale
    resetWindowPosition(el);

    // Drag (desktop uniquement)
    if (header) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        header.addEventListener('pointerdown', (e) => {
            if (isMobile()) return;
            if (e.target.closest('.window-resizer')) return;

            isDragging = true;
            e.currentTarget.setPointerCapture(e.pointerId);

            startX = e.clientX;
            startY = e.clientY;
            startLeft = el.offsetLeft;
            startTop = el.offsetTop;

            el.style.transition = 'none';
            el.style.userSelect = 'none';

            // Désactiver les interactions Mapbox pendant le drag
            disableMapInteractions(true);
        });

        header.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            const newLeft = Math.max(0, Math.min(startLeft + dx, window.innerWidth - el.offsetWidth));
            const newTop  = Math.max(0, Math.min(startTop + dy, window.innerHeight - el.offsetHeight));

            el.style.left = newLeft + 'px';
            el.style.top  = newTop  + 'px';
        });

        header.addEventListener('pointerup', () => {
            if (!isDragging) return;
            isDragging = false;
            el.style.userSelect = '';
            disableMapInteractions(false);
        });
    }

    // Resize (desktop uniquement)
    if (resizer) {
        let isResizing = false;
        let startX, startW, startH, aspect;

        resizer.addEventListener('pointerdown', (e) => {
            if (isMobile()) return;
            e.stopPropagation();

            isResizing = true;
            e.currentTarget.setPointerCapture(e.pointerId);

            startX = e.clientX;
            startW = el.offsetWidth;
            startH = el.offsetHeight;
            aspect = startW / startH;

            el.style.transition = 'none';
            disableMapInteractions(true);
        });

        resizer.addEventListener('pointermove', (e) => {
            if (!isResizing) return;
            const newW = Math.max(MIN_SIZE, startW + (e.clientX - startX));
            const newH = newW / aspect;
            if (newH > MIN_SIZE) {
                el.style.width  = newW + 'px';
                el.style.height = newH + 'px';
            }
        });

        resizer.addEventListener('pointerup', () => {
            if (!isResizing) return;
            isResizing = false;
            disableMapInteractions(false);
        });
    }

    // Recalculer position au resize viewport
    window.addEventListener('resize', () => resetWindowPosition(el));
}

// ─── API PUBLIQUE ─────────────────────────────────────────────────────────

export function showWindow(id) {
    hideAllWindows();
    const win = document.getElementById(id);
    if (!win) return;

    win.style.display = 'flex';
    win.style.flexDirection = 'column';
    activeWindows.add(id);

    resetWindowPosition(win);
    document.getElementById('day-carousel').style.display = 'none';
}

export function hideWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    win.style.display = 'none';
    activeWindows.delete(id);
}

export function hideAllWindows() {
    document.querySelectorAll('.os-window').forEach(win => {
        win.style.display = 'none';
        activeWindows.delete(win.id);
    });
}

export function isWindowVisible(id) {
    return activeWindows.has(id);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────

function isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
}

function resetWindowPosition(el) {
    if (isMobile()) {
        // Mobile : centré, 92% largeur, 70vh hauteur
        el.style.position = 'absolute';
        el.style.left = '4%';
        el.style.top  = '10%';
        el.style.width  = '92%';
        el.style.height = '70vh';
        el.style.maxHeight = '75vh';
    } else {
        // Desktop : flottante 380×580
        el.style.position = 'absolute';
        el.style.left   = '20px';
        el.style.top    = '80px';
        el.style.width  = '380px';
        el.style.height = '580px';
        el.style.maxHeight = '80vh';
    }
}

/**
 * Désactive/réactive les interactions Mapbox pendant drag/resize
 * pour éviter les conflits d'events pointer
 */
function disableMapInteractions(disabled) {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    mapEl.style.pointerEvents = disabled ? 'none' : 'auto';
}
