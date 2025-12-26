// src/ui/components/bottomSheet.js
// PHASE 2: Bottom Sheet System (SAFE ADDITIVE FEATURE)
//
// Single sheet presentation (v1 - no stacking)
// - Slides up from bottom with animation
// - Swipe down to dismiss
// - Swipe up to expand
// - Backdrop dimming
// - Focus trap for accessibility
// - Global coordinator (only one sheet at a time)
//
// Desktop: Can be docked as floating panel (unified component approach)
// Mobile: Full bottom sheet
//
// Feature flag: window.FEATURE_BOTTOM_SHEETS

/**
 * Bottom Sheet Base Class
 * @class BottomSheet
 */
export class BottomSheet {
    static activeSheet = null; // Global sheet coordinator

    constructor(options = {}) {
        const {
            title = 'Sheet',
            content = '',
            dockable = false, // Desktop: dock as floating panel
            onOpen = () => { },
            onClose = () => { },
            maxHeight = '90vh'
        } = options;

        this.title = title;
        this.content = content;
        this.dockable = dockable;
        this.onOpen = onOpen;
        this.onClose = onClose;
        this.maxHeight = maxHeight;
        this.isOpen = false;

        // Touch state for swipe gestures
        this.touchStartY = 0;
        this.touchCurrentY = 0;
        this.isDragging = false;

        this.createElements();
        this.attachEventListeners();
    }

    createElements() {
        // Backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'bottom-sheet-backdrop';
        this.backdrop.setAttribute('aria-hidden', 'true');

        // Sheet container
        this.sheet = document.createElement('div');
        this.sheet.className = 'bottom-sheet';
        this.sheet.setAttribute('role', 'dialog');
        this.sheet.setAttribute('aria-modal', 'true');
        this.sheet.setAttribute('aria-labelledby', 'sheet-title');

        // Drag handle
        const handle = document.createElement('div');
        handle.className = 'bottom-sheet-handle';
        handle.setAttribute('aria-label', 'Drag to resize or dismiss');

        const handleBar = document.createElement('div');
        handleBar.className = 'bottom-sheet-handle-bar';
        handle.appendChild(handleBar);

        // Header
        const header = document.createElement('div');
        header.className = 'bottom-sheet-header';

        const titleEl = document.createElement('h2');
        titleEl.id = 'sheet-title';
        titleEl.className = 'bottom-sheet-title';
        titleEl.textContent = this.title;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'bottom-sheet-close';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', () => this.close());

        header.appendChild(titleEl);
        header.appendChild(closeBtn);

        // Content
        this.contentEl = document.createElement('div');
        this.contentEl.className = 'bottom-sheet-content';
        if (typeof this.content === 'string') {
            this.contentEl.innerHTML = this.content;
        } else if (this.content instanceof HTMLElement) {
            this.contentEl.appendChild(this.content);
        }

        // Assemble
        this.sheet.appendChild(handle);
        this.sheet.appendChild(header);
        this.sheet.appendChild(this.contentEl);

        // Root container
        this.el = document.createElement('div');
        this.el.className = 'bottom-sheet-container';
        this.el.appendChild(this.backdrop);
        this.el.appendChild(this.sheet);

        // Desktop docking
        if (this.dockable && window.innerWidth >= 641) {
            this.el.classList.add('docked');
        }
    }

    attachEventListeners() {
        // Backdrop click to close
        this.backdrop.addEventListener('click', () => this.close());

        // Escape key to close
        this.handleEscape = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        };

        // Touch/mouse drag for swipe
        const handle = this.sheet.querySelector('.bottom-sheet-handle');

        handle.addEventListener('touchstart', (e) => this.onDragStart(e), { passive: true });
        handle.addEventListener('touchmove', (e) => this.onDragMove(e), { passive: false });
        handle.addEventListener('touchend', (e) => this.onDragEnd(e));

        handle.addEventListener('mousedown', (e) => this.onDragStart(e));
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) this.onDragMove(e);
        });
        document.addEventListener('mouseup', (e) => this.onDragEnd(e));

        // Responsive resize
        window.addEventListener('resize', () => this.handleResize());
    }

    onDragStart(e) {
        this.isDragging = true;
        this.touchStartY = e.touches ? e.touches[0].clientY : e.clientY;
        this.sheet.style.transition = 'none';
    }

    onDragMove(e) {
        if (!this.isDragging) return;

        this.touchCurrentY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = this.touchCurrentY - this.touchStartY;

        // Only allow downward dragging
        if (deltaY > 0) {
            e.preventDefault();
            this.sheet.style.transform = `translateY(${deltaY}px)`;
        }
    }

    onDragEnd(e) {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.sheet.style.transition = '';

        const deltaY = this.touchCurrentY - this.touchStartY;

        // Close if dragged down more than 100px
        if (deltaY > 100) {
            this.close();
        } else {
            // Snap back
            this.sheet.style.transform = '';
        }
    }

    handleResize() {
        // Update docking state on resize
        if (this.dockable) {
            if (window.innerWidth >= 641) {
                this.el.classList.add('docked');
            } else {
                this.el.classList.remove('docked');
            }
        }
    }

    open() {
        // Check feature flag
        if (!window.FEATURE_BOTTOM_SHEETS) {
            console.warn('[Bottom Sheet] Feature disabled');
            return;
        }

        // Close any other open sheet
        BottomSheet.closeAll();

        // Mark as active
        BottomSheet.activeSheet = this;
        this.isOpen = true;

        // Add to DOM
        if (!this.el.parentNode) {
            document.body.appendChild(this.el);
        }

        // Trigger animation
        requestAnimationFrame(() => {
            this.el.classList.add('open');
        });

        // Disable globe/map gestures
        window.dispatchEvent(new CustomEvent('bottomSheetOpened', { detail: { sheet: this } }));

        // Focus trap
        document.addEventListener('keydown', this.handleEscape);

        // Callback
        this.onOpen();
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.el.classList.remove('open');

        // Re-enable globe/map gestures
        window.dispatchEvent(new CustomEvent('bottomSheetClosed', { detail: { sheet: this } }));

        // Remove from active
        if (BottomSheet.activeSheet === this) {
            BottomSheet.activeSheet = null;
        }

        // Remove from DOM after animation
        setTimeout(() => {
            if (this.el.parentNode && !this.isOpen) {
                this.el.parentNode.removeChild(this.el);
            }
        }, 300);

        // Remove escape listener
        document.removeEventListener('keydown', this.handleEscape);

        // Callback
        this.onClose();
    }

    setContent(content) {
        this.content = content;
        if (typeof content === 'string') {
            this.contentEl.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.contentEl.innerHTML = '';
            this.contentEl.appendChild(content);
        }
    }

    static closeAll() {
        if (BottomSheet.activeSheet) {
            BottomSheet.activeSheet.close();
        }
    }
}

/**
 * Helper function to create a bottom sheet
 * @param {Object} options - Sheet options
 * @returns {BottomSheet} Sheet instance
 */
export function createBottomSheet(options) {
    return new BottomSheet(options);
}
