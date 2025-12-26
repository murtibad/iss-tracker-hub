// src/utils/gestureController.js
// PHASE 3: Gesture Controller with Arbitration (SAFE ADDITIVE)
//
// Purpose: Coordinate gestures between globe/map and bottom sheets
// - When sheet is open: disable globe/map gestures
// - When sheet is closed: enable globe/map gestures
// - Dual input: Touch events + Mouse events (desktop compatibility)
//
// Gestures:
// - Single finger drag → Rotate globe/pan map
// - Pinch → Zoom
// - Double tap → Focus on ISS
// - Long press on ISS → Open ISS info sheet
//
// Feature flag: Automatically integrates with FEATURE_BOTTOM_SHEETS

class GestureController {
    constructor() {
        this.globeGesturesEnabled = true;
        this.mapGesturesEnabled = true;
        this.activeSheet = null;

        // Touch state for long press detection
        this.touchStartTime = 0;
        this.touchStartPos = { x: 0, y: 0 };
        this.longPressTimeout = null;
        this.longPressThreshold = 500; // ms

        // Double tap detection
        this.lastTapTime = 0;
        this.doubleTapThreshold = 300; // ms

        this.init();
    }

    init() {
        // Listen for bottom sheet events
        window.addEventListener('bottomSheetOpened', (e) => {
            console.log('[Gesture] Bottom sheet opened, locking globe/map gestures');
            this.lockGlobeGestures();
            this.activeSheet = e.detail?.sheet || null;
        });

        window.addEventListener('bottomSheetClosed', (e) => {
            console.log('[Gesture] Bottom sheet closed, unlocking globe/map gestures');
            this.unlockGlobeGestures();
            this.activeSheet = null;
        });

        // Add gesture listeners to globe and map containers
        this.attachGestureListeners();
    }

    lockGlobeGestures() {
        this.globeGesturesEnabled = false;

        // Disable globe controls (Three.js OrbitControls)
        if (window.globeInstance && window.globeInstance.controls) {
            try {
                window.globeInstance.controls().enabled = false;
                console.log('[Gesture] Globe controls disabled');
            } catch (e) {
                console.warn('[Gesture] Could not disable globe controls', e);
            }
        }

        // Disable map interactions (MapLibre)
        if (window.mapInstance) {
            try {
                window.mapInstance.dragPan.disable();
                window.mapInstance.touchZoomRotate.disable();
                window.mapInstance.scrollZoom.disable();
                console.log('[Gesture] Map interactions disabled');
            } catch (e) {
                console.warn('[Gesture] Could not disable map interactions', e);
            }
        }
    }

    unlockGlobeGestures() {
        this.globeGesturesEnabled = true;

        // Re-enable globe controls
        if (window.globeInstance && window.globeInstance.controls) {
            try {
                window.globeInstance.controls().enabled = true;
                console.log('[Gesture] Globe controls enabled');
            } catch (e) {
                console.warn('[Gesture] Could not enable globe controls', e);
            }
        }

        // Re-enable map interactions
        if (window.mapInstance) {
            try {
                window.mapInstance.dragPan.enable();
                window.mapInstance.touchZoomRotate.enable();
                window.mapInstance.scrollZoom.enable();
                console.log('[Gesture] Map interactions enabled');
            } catch (e) {
                console.warn('[Gesture] Could not enable map interactions', e);
            }
        }
    }

    attachGestureListeners() {
        // Find globe and map containers
        const globeContainer = document.querySelector('#globe-container, .globe-container');
        const mapContainer = document.querySelector('#map-container, .maplibregl-map');

        if (globeContainer) {
            this.attachToElement(globeContainer, 'globe');
        }

        if (mapContainer) {
            this.attachToElement(mapContainer, 'map');
        }
    }

    attachToElement(element, type) {
        // Touch events
        element.addEventListener('touchstart', (e) => this.handleTouchStart(e, type), { passive: false });
        element.addEventListener('touchmove', (e) => this.handleTouchMove(e, type), { passive: false });
        element.addEventListener('touchend', (e) => this.handleTouchEnd(e, type), { passive: false });

        // Mouse events (desktop)
        element.addEventListener('dblclick', (e) => this.handleDoubleClick(e, type));

        console.log(`[Gesture] Attached listeners to ${type} container`);
    }

    handleTouchStart(e, type) {
        // Don't process if sheet is open
        if (!this.globeGesturesEnabled) return;

        const touch = e.touches[0];
        this.touchStartTime = Date.now();
        this.touchStartPos = { x: touch.clientX, y: touch.clientY };

        // Start long press detection
        this.longPressTimeout = setTimeout(() => {
            this.handleLongPress(e, type);
        }, this.longPressThreshold);
    }

    handleTouchMove(e, type) {
        // Cancel long press if finger moves too much
        if (this.longPressTimeout) {
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - this.touchStartPos.x);
            const deltaY = Math.abs(touch.clientY - this.touchStartPos.y);

            // If moved more than 10px, it's not a long press
            if (deltaX > 10 || deltaY > 10) {
                clearTimeout(this.longPressTimeout);
                this.longPressTimeout = null;
            }
        }
    }

    handleTouchEnd(e, type) {
        // Clear long press timeout
        if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
            this.longPressTimeout = null;
        }

        // Don't process if sheet is open
        if (!this.globeGesturesEnabled) return;

        // Check for double tap
        const now = Date.now();
        if (now - this.lastTapTime < this.doubleTapThreshold) {
            this.handleDoubleTap(e, type);
            this.lastTapTime = 0; // Reset
        } else {
            this.lastTapTime = now;
        }
    }

    handleDoubleTap(e, type) {
        console.log(`[Gesture] Double tap detected on ${type}`);

        // Focus on ISS
        this.focusOnISS();

        // Prevent default to avoid zoom on mobile
        e.preventDefault();
    }

    handleDoubleClick(e, type) {
        console.log(`[Gesture] Double click detected on ${type}`);

        // Focus on ISS (same as double tap)
        this.focusOnISS();
    }

    handleLongPress(e, type) {
        console.log(`[Gesture] Long press detected on ${type}`);

        // Check if long press is on ISS marker
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);

        // Simple heuristic: check if clicked element or parent has ISS-related class/id
        if (this.isISSElement(element)) {
            console.log('[Gesture] Long press on ISS, opening info sheet');
            this.openISSInfoSheet();
        }
    }

    isISSElement(element) {
        if (!element) return false;

        // Check element and up to 3 parents
        let current = element;
        for (let i = 0; i < 4; i++) {
            if (!current) break;

            const className = current.className || '';
            const id = current.id || '';

            // Check for ISS-related identifiers
            if (
                className.includes('iss') ||
                id.includes('iss') ||
                className.includes('satellite') ||
                current.dataset?.type === 'iss'
            ) {
                return true;
            }

            current = current.parentElement;
        }

        return false;
    }

    focusOnISS() {
        // Dispatch custom event that globe/map can listen to
        window.dispatchEvent(new CustomEvent('focusISS'));

        // Fallback: Try to call global function if exists
        if (typeof window.focusOnISS === 'function') {
            window.focusOnISS();
        }
    }

    openISSInfoSheet() {
        // Dispatch custom event that can be caught by boot.js
        window.dispatchEvent(new CustomEvent('openISSInfo'));
    }
}

// Auto-initialize if feature flag is enabled
let gestureControllerInstance = null;

if (window.FEATURE_BOTTOM_SHEETS) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            gestureControllerInstance = new GestureController();
            console.log('[Gesture Controller] Initialized');
        });
    } else {
        gestureControllerInstance = new GestureController();
        console.log('[Gesture Controller] Initialized');
    }
}

export { GestureController, gestureControllerInstance };
