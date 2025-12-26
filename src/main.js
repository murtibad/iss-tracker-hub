// src/main.js
// TR: CSS burada import edilir. Uygulama boot edilir.
// EN: CSS imported here. App bootstraps here.

import "./styles/theme.css";
import "./styles/cyberpunk.css";
import "./styles/layout.css"; // Responsive layout
import "./styles/fixes.css"; // <-- HUD/Leaflet z-index düzeltmesi
import "./styles/accessibility.css"; // <-- Accessibility for elderly users (60-70 age group)
import "./styles/animations.css"; // <-- Modern micro-interactions and transitions
import "./styles/mobile-layout.css"; // <-- PHASE 0: Mobile-first foundation (SAFE ADDITIVE)
import "./styles/bottomControlBar.css"; // <-- PHASE 1: Bottom control bar (SAFE ADDITIVE)
import "./styles/bottomSheet.css"; // <-- PHASE 2: Bottom sheet system (SAFE ADDITIVE)
import "./styles/visual-polish.css"; // <-- VISUAL POLISH: Designer refinements
import "./styles/hud-fixes.css"; // <-- FIX: Floating HUD z-index and overlap

import { createStore } from "./state/store.js";
import { boot } from "./app/boot.js";
import { themeManager } from "./services/themeManager.js";

// Initialize theme system
themeManager.init();
console.log(`[ISS Tracker] Theme initialized:`, themeManager.getCurrentTheme());

const store = createStore();
const rootEl = document.getElementById("app");

// ========== PHASE 0: FEATURE FLAG (SAFE ADDITIVE) ==========
window.FEATURE_MOBILE_LAYOUT = true;
window.FEATURE_MOBILE_BOTTOM_BAR = true; // PHASE 1: Bottom control bar
window.FEATURE_BOTTOM_SHEETS = true; // PHASE 2: Bottom sheet system

// PHASE 3: Gesture Controller (auto-initializes if FEATURE_BOTTOM_SHEETS is true)
import './utils/gestureController.js';

if (window.FEATURE_MOBILE_LAYOUT && window.innerWidth <= 640) {
    document.body.classList.add('mobile-ux-enabled');
}
window.addEventListener('resize', () => {
    if (!window.FEATURE_MOBILE_LAYOUT) return;
    window.innerWidth <= 640
        ? document.body.classList.add('mobile-ux-enabled')
        : document.body.classList.remove('mobile-ux-enabled');
});
// ===========================================================

boot(store, rootEl);
