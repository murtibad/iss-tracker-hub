// src/main.js
// TR: CSS burada import edilir. Uygulama boot edilir.
// EN: CSS imported here. App bootstraps here.

import "./styles/theme.css";
import "./styles/cyberpunk.css";
import "./styles/layout.css"; // Responsive layout
import "./styles/fixes.css"; // <-- HUD/Leaflet z-index düzeltmesi

import { createStore } from "./state/store.js";
import { boot } from "./app/boot.js";
import { themeManager } from "./services/themeManager.js";

// Initialize theme system
themeManager.init();
console.log(`[ISS Tracker] Theme initialized:`, themeManager.getCurrentTheme());

const store = createStore();
const rootEl = document.getElementById("app");

boot(store, rootEl);
