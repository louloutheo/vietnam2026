export class OsWindow extends HTMLElement {
    constructor() {
        super();
        this.isDragging = false;
        this.currentX = 0; this.currentY = 0;
        this.initialX = 0; this.initialY = 0;
        this.xOffset = 0;  this.yOffset = 0;
    }

    connectedCallback() {
        if (this.querySelector('.window-header')) return; 

        const title = this.getAttribute('title') || 'Application';
        
        // On sauvegarde le contenu existant
        const originalContent = document.createElement('div');
        while (this.firstChild) {
            originalContent.appendChild(this.firstChild);
        }

        // On insère l'en-tête de la fenêtre
        this.innerHTML = `
            <div class="window-header">
                <span class="window-title">${title}</span>
                <button class="window-close">✕</button>
            </div>
            <div class="window-content"></div>
        `;

        // On remet le contenu à l'intérieur
        this.querySelector('.window-content').appendChild(originalContent);
        
        this.header = this.querySelector('.window-header');
        this.setupEvents();
    }

    setupEvents() {
        if (window.matchMedia("(max-width: 768px)").matches) {
            this.style.width = "90%"; this.style.left = "5%"; this.style.top = "5%";
            return;
        }

        this.header.addEventListener('mousedown', (e) => this.dragStart(e));
        document.addEventListener('mouseup', () => this.dragEnd());
        document.addEventListener('mousemove', (e) => this.drag(e));
    }

    dragStart(e) {
        this.initialX = e.clientX - this.xOffset;
        this.initialY = e.clientY - this.yOffset;
        this.isDragging = true;
        
        document.querySelectorAll('os-window').forEach(w => w.style.zIndex = 10);
        this.style.zIndex = 100;
    }

    dragEnd() {
        this.initialX = this.currentX;
        this.initialY = this.currentY;
        this.isDragging = false;
    }

    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        this.currentX = e.clientX - this.initialX;
        this.currentY = e.clientY - this.initialY;
        this.xOffset = this.currentX;
        this.yOffset = this.currentY;

        requestAnimationFrame(() => {
            this.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;
        });
    }
}

customElements.define('os-window', OsWindow);