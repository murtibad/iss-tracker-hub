// src/main.js
// TR: CSS burada import edilir. Uygulama boot edilir.
// EN: CSS imported here. App bootstraps here.

import "./styles/theme.css";
import "./styles/fixes.css"; // <-- HUD/Leaflet z-index düzeltmesi

import { createStore } from "./state/store.js";
import { boot } from "./app/boot.js";

const store = createStore();
const rootEl = document.getElementById("app");

boot(store, rootEl);
