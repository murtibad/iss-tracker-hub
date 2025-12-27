// src/app/boot.js
// TR: Uygulamanın giriş noktası. UI + harita + telemetry + pass prediction + 2D/3D toggle.

import { createMapLibreView } from "../ui/maplibreView.js";

import { CONFIG } from "../constants/config.js";
import cities from "../assets/cities.tr.json";

import { computePassBundle } from "../services/prediction.js";
import { calculateTrajectory, trajectoryToGeoJSON } from "../services/trajectory.js";
import { startMotion, getLastKnownData } from "../services/issMotion.js";
import { createViewModeToggle, getInitialViewMode, getInitialFocusMode } from "../ui/viewModeToggleView.js";
import { createWeatherBadge } from "../ui/weatherBadgeView.js";
import { fetchCurrentWeather, weatherCodeLabel } from "../services/weather.js";
import { createThemePicker, applyGlassColor, getGlassColor } from "../ui/themePickerView.js";
import { showLocationWelcome } from "../ui/locationWelcomeModal.js";
// languagePickerView removed - succeeded by Settings Modal
import { initI18n, t, getCurrentLanguage, getSpeedUnit, getDistanceUnit } from "../i18n/i18n.js";

import { ICONS } from "../ui/icons.js";

// Floating HUD (Compact Telemetry v0.3.3)
import { createFloatingHUD } from "../ui/components/floatingHUD.js";
import { createSettingsModal } from "../ui/settingsModal.js";
import { createSettingsSheet } from "../ui/settingsModalSheet.js"; // PHASE 2: Settings as bottom sheet (SAFE ADDITIVE)
import { createHelpSheet } from "../ui/helpModalSheet.js"; // PHASE 2: Help as bottom sheet (SAFE ADDITIVE)
import { createAuthSheet } from "../ui/authModalSheet.js"; // PHASE 2: Auth as bottom sheet (SAFE ADDITIVE)
import { createNetworkStatusBar } from "../ui/components/networkStatusBar.js";
import { createLandingHero } from "../ui/components/landingHero.js";
// import { createPassCard } from "../ui/passCardView.js"; // Temporarily disabled
import { createMobileNavBar } from "../ui/components/mobileNavBar.js";
// import { createNASALiveCard } from "../ui/components/NASALiveCard.js"; // Temporarily disabled
import { createAuthModal, createUserButton } from "../ui/components/authModal.js";
import { createHelpModal } from "../ui/components/helpModal.js"; // Help Modal
import { createBottomControlBar } from "../ui/components/bottomControlBar.js"; // PHASE 1: Mobile bottom bar (SAFE ADDITIVE)
import { schedulePassNotification, areNotificationsEnabled } from "../services/passNotification.js"; // Phase 5 Notifications
import { onAuthChange, getUser, logout } from "../services/authService.js";
import { showToast } from "../ui/components/toastManager.js"; // Phase 6 Feedback
import { createIntro } from "../ui/intro.js"; // Phase X Landing Animation

// API Status Widget (Stateful Architecture Demonstration)
import { createApiStatusWidget, reportApiCall } from "../ui/widgets/apiStatusWidget.js";
import "../styles/apiStatusWidget.css";

// WhereTheISS.at
const ISS_URL = "https://api.wheretheiss.at/v1/satellites/25544";

// ------- Utils -------
function fmtNum(n, digits = 2) {
  if (typeof n !== "number" || Number.isNaN(n)) return "--";
  return n.toFixed(digits);
}
function fmtInt(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "--";
  return String(Math.round(n));
}
function pad2(n) {
  const x = Math.max(0, Math.floor(n));
  return x < 10 ? `0${x}` : `${x}`;
}
function fmtHMS(ms) {
  if (typeof ms !== "number" || Number.isNaN(ms)) return "--:--:--";
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}
function clampLat(lat) {
  return Math.max(-85, Math.min(85, lat));
}
function normalizeLon(lon) {
  let x = lon;
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  return x;
}
function safeJsonParse(txt) {
  try {
    return JSON.parse(txt);
  } catch {
    return null;
  }
}
// Safe localStorage wrapper
const safeStorage = {
  getItem: (key) => {
    try {
      return window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (e) {
      console.warn('[Storage] getItem failed:', e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      if (window.localStorage) window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn('[Storage] setItem failed:', e);
    }
  }
};

function buildEl(tag, className, parent) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (parent) parent.appendChild(n);
  return n;
}

// ------- Theme (system/dark/light) -------
function applyTheme(mode) {
  const root = document.documentElement;

  const prefersDark = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;

  let resolved = mode;
  if (mode === "system") resolved = prefersDark ? "dark" : "light";
  root.setAttribute("data-theme", resolved);
  return resolved;
}

function getInitialThemeMode() {
  const key = CONFIG?.THEME_STORAGE_KEY || "issThemeMode";
  const saved = safeStorage.getItem(key);
  const valid = saved === "light" || saved === "dark" || saved === "system";
  return valid ? saved : (CONFIG?.DEFAULT_THEME || "system");
}

function setThemeMode(mode) {
  const key = CONFIG?.THEME_STORAGE_KEY || "issThemeMode";
  safeStorage.setItem(key, mode);
  return applyTheme(mode);
}

// ------- Skin (cyberpunk/liquid/realistic) -------
const SKIN_KEY = "isshub:skin";
function getInitialSkin() {
  const v = safeStorage.getItem(SKIN_KEY);
  if (v === "cyberpunk" || v === "liquid" || v === "realistic") return v;
  return "realistic";
}

function applySkin(skin) {
  const root = document.documentElement;
  root.setAttribute("data-skin", skin);

  // 3D sahne ışıkları (globeView.js -> window.issLights: { sun, ambient, starsMat })
  const Ls = window.issLights;
  if (!Ls) return;

  try {
    if (skin === "cyberpunk") {
      Ls.sun?.color?.set?.(0xff66ff);
      Ls.ambient?.color?.set?.(0x00ffee);
      if (Ls.sun) Ls.sun.intensity = 0.6;
      if (Ls.ambient) Ls.ambient.intensity = 0.18;
      Ls.starsMat?.color?.set?.(0xff66ff);
    } else if (skin === "liquid") {
      Ls.sun?.color?.set?.(0xffffff);
      Ls.ambient?.color?.set?.(0xffffff);
      if (Ls.sun) Ls.sun.intensity = 0.85;
      if (Ls.ambient) Ls.ambient.intensity = 0.32;
      Ls.starsMat?.color?.set?.(0xffffff);
    } else {
      // realistic
      Ls.sun?.color?.set?.(0xfff5e5);
      Ls.ambient?.color?.set?.(0xffffff);
      if (Ls.sun) Ls.sun.intensity = 0.55;
      if (Ls.ambient) Ls.ambient.intensity = 0.14;
      Ls.starsMat?.color?.set?.(0xffffff);
    }
  } catch {
    // sessiz
  }
}

function setSkin(skin) {
  safeStorage.setItem(SKIN_KEY, skin);
  applySkin(skin);
  showToast(skin === "realistic" ? t('skinRealistic') || "Realistic Mode" : t('skinLiquid') || "Liquid Mode");
}

// ------- Yer/konum yardımcıları -------
const PLACE_STORAGE_KEY = "isshub:place_v2";

function safeGetPlace() {
  try {
    const raw = safeStorage.getItem(PLACE_STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return null;
    return {
      cityName: typeof obj.cityName === "string" ? obj.cityName : null,
      districtName: typeof obj.districtName === "string" ? obj.districtName : null,
      neighborhoodName: typeof obj.neighborhoodName === "string" ? obj.neighborhoodName : null,
      displayName: typeof obj.displayName === "string" ? obj.displayName : null,
      osmType: typeof obj.osmType === "string" ? obj.osmType : null,
      osmId: typeof obj.osmId === "string" ? obj.osmId : null,
      lat: typeof obj.lat === "number" ? obj.lat : null,
      lon: typeof obj.lon === "number" ? obj.lon : null,
    };
  } catch {
    return null;
  }
}

function safeSetPlace(place) {
  try {
    safeStorage.setItem(PLACE_STORAGE_KEY, JSON.stringify(place));
  } catch {
    // sessiz
  }
}

function placeLabel(p) {
  if (!p) return "Konumum";
  const parts = [];
  if (p.cityName) parts.push(p.cityName);
  if (p.districtName) parts.push(p.districtName);
  if (p.neighborhoodName) parts.push(p.neighborhoodName);
  return parts.join(" / ") || "Konumum";
}

// TR: Nominatim
function getNominatimBase() {
  const base = (CONFIG?.NOMINATIM_PROXY_URL || "").trim();
  if (base) return base.replace(/\/+$/, "");
  return "https://nominatim.openstreetmap.org";
}
async function nominatimFetch(path, params) {
  const base = getNominatimBase();
  const url = new URL(base + path);

  const qp = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    ...params,
  });

  if (CONFIG?.NOMINATIM_EMAIL) qp.set("email", String(CONFIG.NOMINATIM_EMAIL));
  url.search = qp.toString();

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`nominatim http ${res.status}`);
  return await res.json();
}

function extractPlaceFromNominatim(item) {
  const addr = item?.address || {};
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.county ||
    addr.state ||
    null;

  const district =
    addr.city_district ||
    addr.district ||
    addr.borough ||
    addr.county ||
    addr.state_district ||
    null;

  const neighborhood =
    addr.neighbourhood ||
    addr.suburb ||
    addr.quarter ||
    addr.hamlet ||
    null;

  const lat = item?.lat != null ? Number(item.lat) : null;
  const lon = item?.lon != null ? Number(item.lon) : null;

  const osmType = item?.osm_type ? String(item.osm_type) : null;
  const osmId = item?.osm_id != null ? String(item.osm_id) : null;

  return {
    cityName: city,
    districtName: district,
    neighborhoodName: neighborhood,
    displayName: item?.display_name ? String(item.display_name) : null,
    osmType,
    osmId,
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
  };
}

async function tryGetGpsOnce({ timeoutMs = 9000 } = {}) {
  if (!navigator.geolocation) throw new Error("geolocation not supported");
  return await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({
          lat: Number(pos.coords.latitude),
          lon: Number(pos.coords.longitude),
          accuracy: Number(pos.coords.accuracy),
        });
      },
      (err) => {
        clearTimeout(timer);
        reject(err || new Error("geolocation error"));
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: timeoutMs }
    );
  });
}

// ------- Boot -------
export async function boot(store, rootEl) {
  if (!rootEl) throw new Error("rootEl missing");

  // Show intro animation (first visit only)

  // Initialize i18n system (auto-detect from IP if first time)
  try {
    const lang = await initI18n();
    console.log(`[boot] Language initialized: ${lang}`);
  } catch (e) {
    console.warn("[boot] i18n initialization failed:", e);
  }

  // Root
  rootEl.innerHTML = "";
  const hub = buildEl("div", "hub", rootEl);

  // Map container
  const mapEl = buildEl("div", "hub-map", hub);
  mapEl.id = "map";

  const overlay = buildEl("div", "hub-overlay", hub);

  // Topbar
  const topbar = buildEl("div", "hub-topbar hub-glass", overlay);
  const brand = buildEl("div", "hub-brand", topbar);
  const logo = buildEl("div", "hub-logo", brand);
  // Add logo image
  logo.innerHTML = `<img src="./icons/icon-192.png" alt="App Logo" style="width: 100%; height: 100%; object-fit: contain;">`;
  logo.setAttribute("aria-hidden", "true");

  const title = buildEl("div", "hub-title", brand);
  const titleMain = buildEl("div", "t", title);
  titleMain.textContent = "ISS Tracker HUB";
  const s = buildEl("div", "s", title);
  s.textContent = `beta ${CONFIG.VERSION}`;

  const actions = buildEl("div", "hub-actions", topbar);

  // Follow pill (the only essential control in top bar)
  const followPill = buildEl("button", "btn hub-pill", actions); // Changed to button for semantics
  const followDot = buildEl("div", "hub-dot", followPill);
  const followTxt = buildEl("div", "", followPill);

  // Explicit "Mode" explanation
  const modeLabel = t('follow') === 'Takip' ? 'Modu' : 'Mode';
  followTxt.innerHTML = `<span style="font-weight:400; opacity:0.8">ISS ${modeLabel}:</span> <strong>${t('on')}</strong>`;

  followPill.setAttribute("aria-label", t('follow'));
  followPill.style.minHeight = "44px";

  // Settings button (opens settings modal) - Explicit Label for Elderly UX
  const settingsBtn = buildEl("button", "btn settings-btn", actions);
  settingsBtn.type = "button";
  // Icon + Text Structure
  settingsBtn.innerHTML = `${ICONS.settings} <span>${t('settings')}</span>`;
  settingsBtn.title = t('settings');
  settingsBtn.setAttribute("aria-label", t('settings'));
  settingsBtn.style.cssText = "font-size: 18px; padding: 8px 16px; min-height: 44px;";

  // Create Settings Modal/Sheet (PHASE 2: Bottom sheet when feature enabled)
  const settingsModal = window.FEATURE_BOTTOM_SHEETS
    ? createSettingsSheet({ onOpenLocation: () => openLocModal() })
    : createSettingsModal({ onOpenLocation: () => openLocModal() });
  rootEl.appendChild(settingsModal.el);

  // Settings click handler
  settingsBtn.addEventListener("click", () => {
    settingsModal.open();
  });

  // ========== AUTH MODAL/SHEET (PHASE 2: Sheet when feature enabled) ==========
  const authModal = window.FEATURE_BOTTOM_SHEETS
    ? createAuthSheet()
    : createAuthModal();
  rootEl.appendChild(authModal.el);

  // ========== HELP MODAL/SHEET (PHASE 2: Sheet when feature enabled) ==========
  const helpModal = window.FEATURE_BOTTOM_SHEETS
    ? createHelpSheet()
    : createHelpModal();
  rootEl.appendChild(helpModal.el);

  // Help Button (Top Bar)
  const helpBtn = buildEl("button", "btn help-btn", actions);
  helpBtn.type = "button";
  // Icon + Text Structure (Elderly UX)
  // Reusing settings icon temporarily if no help icon, or use generic '?'
  const helpIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  helpBtn.innerHTML = `${helpIcon} <span>${t('helpTitle').split(' ')[0]}</span>`;
  helpBtn.title = t('helpTitle');
  helpBtn.setAttribute("aria-label", t('helpTitle'));
  helpBtn.style.cssText = "font-size: 18px; padding: 8px 16px; min-height: 44px;";

  helpBtn.addEventListener("click", () => {
    helpModal.open();
  });

  // User button in topbar
  const userButton = createUserButton();
  actions.insertBefore(userButton.el, settingsBtn);

  userButton.button.addEventListener("click", () => {
    const user = getUser();
    if (user) {
      // Show profile menu or logout option
      if (confirm(t('authLogout') + '?')) {
        logout();
      }
    } else {
      authModal.open('login');
    }
  });

  // ========== LANGUAGE CHANGE LISTENER - UPDATE HEADER BUTTONS ==========
  window.addEventListener('language-change', () => {
    // Update Settings button
    settingsBtn.innerHTML = `${ICONS.settings} <span>${t('settings')}</span>`;
    settingsBtn.title = t('settings');
    settingsBtn.setAttribute("aria-label", t('settings'));

    // Update Help button
    helpBtn.innerHTML = `${helpIcon} <span>${t('helpTitle').split(' ')[0]}</span>`;
    helpBtn.title = t('helpTitle');
    helpBtn.setAttribute("aria-label", t('helpTitle'));

    // Update tracking text
    const modeLabel = t('follow') === 'Takip' ? 'Modu' : 'Mode';
    followTxt.innerHTML = trackEnabled
      ? `<span style="font-weight:400; opacity:0.8">ISS ${modeLabel}:</span> <strong>${t('on')}</strong>`
      : `<span style="font-weight:400; opacity:0.8">ISS ${modeLabel}:</span> <strong>${t('off')}</strong>`;

    console.log('[Boot] Language changed, header updated');
  });

  // ========== FLOATING HUD: Compact Telemetry Display ==========
  const dashboard = createFloatingHUD({ store }); // Pass store for API monitoring
  rootEl.appendChild(dashboard.el);
  // Network Status Bar
  const networkStatus = createNetworkStatusBar();
  rootEl.appendChild(networkStatus.el);

  // ========== API STATUS WIDGET: Stateful Architecture Demo ==========
  const apiStatusWidget = createApiStatusWidget(rootEl, store);

  // Use dashboard's integrated log for status updates
  // Landing Hero
  const log = (msg) => console.log(`[ISS] ${msg}`);

  const termSub = { textContent: "" };  // Placeholder - dashboard manages this internally

  // ========== PASS CARD - TEMPORARILY DISABLED ==========
  // TODO: Redesign pass card from scratch
  /*
  const passSection = buildEl("div", "pass-section", overlay);
  passSection.id = "pass-section";
  passSection.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    max-width: 320px;
    width: calc(100% - 40px);
    z-index: 200;
    display: block;
  `;

  const passCard = createPassCard();
  passSection.appendChild(passCard.el);
  */

  // ========== NASA LIVE CARD - TEMPORARILY DISABLED ==========
  // TODO: Re-enable when NASA stream is working properly
  /*
  const nasaSection = buildEl("div", "nasa-section", overlay);
  nasaSection.id = "nasa-section";
  nasaSection.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    max-width: 360px;
    width: calc(40% - 20px);
    min-width: 280px;
    z-index: 150;
    display: block;
  `;
  const nasaCard = createNASALiveCard();
  nasaSection.appendChild(nasaCard.el);

  // Info note for NASA stream
  const nasaNote = buildEl("div", "nasa-note", nasaSection);
  nasaNote.style.cssText = `
    font-size: 10px;
    color: var(--muted);
    text-align: center;
    padding: 8px;
    opacity: 0.7;
  `;
  nasaNote.textContent = t('nasaNote') || "⚠️ Stream may have interruptions based on ISS signal status.";
  */


  // ---------- Local state ----------
  const localState = {
    cityName: "Konumum",
    districtName: null,
    neighborhoodName: null,
    obsLat: null,
    obsLon: null,
    prediction: null,
    lastPredictionRefresh: 0,
    predictionBusy: false,
    lastTelemetryLogAt: 0,
    lastTelemetryAt: 0,
    lastIssLat: null,
    lastIssLon: null,
  };

  function syncCityText() {
    // No longer needed for old cards
    // Could update telemetry widget title or location if it supported it
  }

  // ------- PASS PREDICTION -------
  function setPredictionFromPass(passObj) {
    if (!passObj) {
      localState.prediction = null;
      return;
    }
    const maxElev = Number(passObj.maxElev);
    const visible = Boolean(passObj.visible);
    const minElev = Number(CONFIG?.MIN_ELEVATION ?? 15);

    localState.prediction = {
      aosMs: Number(passObj.aosMs),
      losMs: Number(passObj.losMs),
      maxElevDeg: Number.isFinite(maxElev) ? maxElev : 0,
      visible,
      reason: visible ? "" : `MAX ${Math.round(maxElev)}° < ${minElev}°`,
      hint: "",
    };
  }
  const landingHero = createLandingHero({
    getPassState: () => ({
      loading: localState.predictionBusy,
      calculating: localState.predictionBusy,
      pass: localState.prediction,
      hasLocation: Number.isFinite(localState.obsLat) && Number.isFinite(localState.obsLon),
      error: false // Could track pass calc errors here
    }),
    onShowPass: () => {
      // Pass card is temporarily disabled
      console.log("[Hero] Pass card temporarily disabled");
      /*
      const passSection = document.getElementById('pass-section');
      if (passSection && passSection.style.display !== 'none') {
        passSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        passSection.classList.add('highlight');
        setTimeout(() => passSection.classList.remove('highlight'), 2000);
      }
      */
    },
    onLiveTrack: () => {
      // Enable follow mode and focus on ISS
      setFollowUI(true);
      // console.log("[Hero] Live Track clicked");
    }
  });
  if (landingHero.el) rootEl.appendChild(landingHero.el);

  // ========== PHASE 1: BOTTOM CONTROL BAR (SAFE ADDITIVE) ==========
  // Mobile-first thumb-zone control bar (only on mobile viewports)
  const bottomBar = createBottomControlBar({
    onISSFocus: () => {
      // Focus on ISS
      setFollowUI(true);
      if (viewMode === '3d' && globe) {
        try {
          globe.setFocusMode('iss');
        } catch (e) {
          console.warn('Globe focus error', e);
        }
      }
    },
    onWorldView: () => {
      // Toggle 2D/3D view
      const newMode = viewMode === '2d' ? '3d' : '2d';
      applyViewMode(newMode);
    },
    onLiveFeed: () => {
      // NASA card is temporarily disabled
      // nasaSection.scrollIntoView({ behavior: 'smooth' });
      console.log('[BottomBar] NASA Live Feed temporarily disabled');
    },
    onSettings: () => {
      // Open settings modal
      settingsModal.open();
    }
  });

  // Append to root only if feature is enabled
  if (bottomBar.el) {
    rootEl.appendChild(bottomBar.el);
    console.log('[PHASE 1] Bottom control bar initialized');
  }
  // ================================================================

  async function calcPredictionNow({ forceLog = false } = {}) {
    const lat = localState.obsLat;
    const lon = localState.obsLon;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      if (forceLog) log(t('passNoLocation'));
      return;
    }
    if (localState.predictionBusy) return;

    localState.predictionBusy = true;
    try {
      log(t('passCalculating') + ` (obs=${fmtNum(lat, 3)},${fmtNum(lon, 3)})`);
      const bundle = await computePassBundle({ obsLat: lat, obsLon: lon });
      const nextPass = bundle?.nextPass || null;

      setPredictionFromPass(nextPass);

      // Phase 5: Schedule Notifications
      if (nextPass && areNotificationsEnabled()) {
        schedulePassNotification({
          startTime: nextPass.aosMs,
          maxElevation: nextPass.maxElev
        });
      }

      localState.lastPredictionRefresh = Date.now();

      if (!nextPass) {
        log(t('passNotFound'));
      } else {
        log(
          `pass> bulundu: AOS=${new Date(nextPass.aosMs).toLocaleTimeString()} LOS=${new Date(
            nextPass.losMs
          ).toLocaleTimeString()} MAX=${Math.round(nextPass.maxElev)}° ${nextPass.visible ? "✅" : "🔴"}`
        );
      }
    } catch (e) {
      log(t('passError') + `: ${String(e?.message || e)}`);
      localState.prediction = null;
    } finally {
      localState.predictionBusy = false;
    }
  }

  function renderPrediction() {
    // Pass card is temporarily disabled
    // TODO: Re-enable when pass card is redesigned
    /*
    const p = localState.prediction;

    if (window.innerWidth > 768) {
      passSection.style.display = 'block';
    }

    if (p && p.aosMs) {
      const now = Date.now();
      const diffMs = p.aosMs - now;
      const diffSec = Math.max(0, Math.floor(diffMs / 1000));
      const h = Math.floor(diffSec / 3600);
      const m = Math.floor((diffSec % 3600) / 60);
      const s = diffSec % 60;
      const countdownText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

      passCard.setState({
        nextPass: p,
        nextVisiblePass: p.visible ? p : null,
        countdownText
      });
    } else {
      passCard.setState({
        nextPass: null,
        nextVisiblePass: null,
        countdownText: localState.predictionBusy ? t('passCalculating') : '--:--:--'
      });
    }
    */
  }

  // ------- MapLibre GL map -------
  const mapView = createMapLibreView(mapEl, {
    center: CONFIG?.DEFAULT_CENTER || [35, 39], // [lng, lat] in MapLibre
    zoom: CONFIG?.DEFAULT_ZOOM || 4,
    onUserInteraction: () => {
      // Disable follow mode on user interaction
      setFollowUI(false);
    }
  });
  const { map, issMarker } = mapView;

  // Theme updates handled by MapTiler Dark Matter style
  function updateTileTheme() {
    // MapLibre uses single style, no tile switching needed
    // Dark Matter theme auto-adapts
  }

  let trackEnabled = true;
  let lastPanLatLng = null;
  let lastPanAt = 0;

  // ---------- 2D / 3D ----------
  let viewMode = getInitialViewMode(); // "2d" | "3d"
  let globe = null;
  let globeLoading = false;
  let viewToggleRef = null;

  function setFollowUI(on) {
    trackEnabled = Boolean(on);
    followDot.style.opacity = on ? "1" : "0.35";
    followTxt.textContent = on ? t('followActive') : t('followInactive');
    followPill.style.opacity = on ? "1" : "0.85";

    // 3D modda globe takibini kontrol et
    if (viewMode === "3d" && globe) {
      try {
        if (on) {
          globe.startFollow();
        } else {
          globe.stopFollow();
        }
      } catch (e) {
        console.warn("Globe follow control error:", e);
      }
    }
  }
  setFollowUI(true);

  followPill.style.cursor = "pointer";
  followPill.addEventListener("click", () => setFollowUI(!trackEnabled));

  async function ensureGlobe() {
    if (globe || globeLoading) return globe;
    globeLoading = true;
    try {
      const mod = await import("../ui/globeView.js");
      const globeApi = mod.globeActions;
      globe = await globeApi.createGlobe(rootEl);
      // API objesini dön
      globe = globeApi;
      // Skin uygulanmış olsun
      applySkin(getInitialSkin());
      return globe;
    } catch (e) {
      log(t('globeLoadFailed') + `: ${e?.message || e}`);
      try { globe?.setVisible(false); } catch { }
      globe = null;
      return null;
    } finally {
      globeLoading = false;
    }
  }

  function applyViewMode(mode) {
    viewMode = mode === "3d" ? "3d" : "2d";

    // Add transition animation
    const animDuration = 400; // ms

    if (viewMode === "3d") {
      // Fade out 2D map
      mapEl.style.transition = `opacity ${animDuration}ms ease`;
      mapEl.style.opacity = '0';

      setTimeout(() => {
        mapEl.style.display = "none";
        mapEl.style.opacity = '1';
      }, animDuration);

      ensureGlobe()
        .then((g) => {
          if (!g) {
            mapEl.style.display = "block";
            try { viewToggleRef?.setMode("2d"); } catch { }
            return;
          }
          g.setVisible(true);
          if (Number.isFinite(localState.lastIssLat) && Number.isFinite(localState.lastIssLon)) {
            try { g.setIssPosition(localState.lastIssLat, localState.lastIssLon); } catch { }
          }
          // Takip etme modu aktifse globe takibini başlat
          if (trackEnabled) {
            try { g.startFollow(); } catch { }
          }
          // Apply cached trajectory to 3D globe
          try { if (window._applyTrajectoryToGlobe) window._applyTrajectoryToGlobe(); } catch { }
        })
        .catch((e) => {
          log(t('globeError') + `: ${e?.message || e}`);
          mapEl.style.display = "block";
          try { viewToggleRef?.setMode("2d"); } catch { }
        });
    } else {
      // Fade out 3D globe
      const globeContainer = document.getElementById('globe-3d-canvas-container');
      if (globeContainer) {
        globeContainer.style.transition = `opacity ${animDuration}ms ease`;
        globeContainer.style.opacity = '0';
        setTimeout(() => {
          try { globe?.setVisible(false); } catch { }
          globeContainer.style.opacity = '1';
        }, animDuration);
      } else {
        try { globe?.setVisible(false); } catch { }
      }

      // Fade in 2D map
      mapEl.style.opacity = '0';
      mapEl.style.display = "block";
      setTimeout(() => {
        mapEl.style.transition = `opacity ${animDuration}ms ease`;
        mapEl.style.opacity = '1';
      }, 50);

      // 2D'ye geçerken globe takibini durdur
      try { globe?.stopFollow(); } catch { }
    }

    // MapLibre auto-resizes, no need for invalidateSize
  }

  // Wire dashboard's 2D/3D toggle to view mode switcher
  // Dashboard buttons trigger this via querySelectorAll event listeners
  const viewToggle = createViewModeToggle({
    initialMode: viewMode,
    onChange: (mode) => applyViewMode(mode),
    onFocusChange: (focusMode) => {
      // Globe odak modunu değiştir
      if (globe && globe.setFocusMode) {
        try {
          globe.setFocusMode(focusMode);
          log(`[3D] Focus mode: ${focusMode === 'iss' ? 'ISS takibi' : 'Dünya görünümü'}`);
        } catch (e) {
          console.warn("Globe focus mode error:", e);
        }
      }
    }
  });
  viewToggleRef = viewToggle;
  rootEl.appendChild(viewToggle.el);

  applyViewMode(viewMode);

  // ---------- Weather badge (ISS altı hava) ----------
  const weatherBadge = createWeatherBadge();
  rootEl.appendChild(weatherBadge.el);

  let lastWeatherAt = 0;
  async function refreshWeatherForIss(lat, lon) {
    const now = Date.now();
    const every = Number(CONFIG?.INTERVAL_WEATHER_REFRESH_MS ?? 45_000);
    if (now - lastWeatherAt < every) return;
    lastWeatherAt = now;

    try {
      const w = await fetchCurrentWeather({ lat, lon });
      const label = weatherCodeLabel(w.code);
      const timeLabel = w.timeIso ? w.timeIso.replace("T", " ") : null;
      weatherBadge.setState({
        placeLabel: `ISS altı (${fmtNum(lat, 1)}, ${fmtNum(lon, 1)})`,
        tempC: w.tempC,
        windKmh: w.windKmh,
        codeLabel: label,
        timeLabel,
        code: w.code // Pass WMO code for visibility hint
      });
    } catch {
      weatherBadge.setState({
        placeLabel: "ISS altı",
        tempC: NaN,
        windKmh: NaN,
        codeLabel: "Hava alınamadı",
        timeLabel: null,
      });
    }
  }

  // ---------- Şehir seç ----------
  if (store && typeof store === "object") {
    if (!store.actions) store.actions = {};
    store.actions.openCityPicker = () => openLocModal();
  }



  // ---------- Location Modal (OSM/Nominatim) ----------
  const locOverlay = buildEl("div", "loc-overlay", rootEl);
  const locCard = buildEl("div", "loc-card hub-glass", locOverlay);

  const locTop = buildEl("div", "loc-top", locCard);
  const locTitle = buildEl("div", "loc-title", locTop);
  locTitle.textContent = t('locationModalTitle');
  const locClose = buildEl("button", "btn", locTop);
  locClose.type = "button";
  locClose.textContent = t('close');

  const locBody = buildEl("div", "loc-body", locCard);

  const locDesc = buildEl("div", "", locBody);
  locDesc.style.fontWeight = "900";
  locDesc.style.opacity = "0.9";
  locDesc.textContent = t('locationModalDesc');

  const locRow = buildEl("div", "loc-row", locBody);
  const locGpsBtn = buildEl("button", "btn", locRow);
  locGpsBtn.type = "button";
  locGpsBtn.textContent = t('useMyLocation');
  const locManualBtn = buildEl("button", "btn", locRow);
  locManualBtn.type = "button";
  locManualBtn.textContent = t('searchLocation');

  const locSearch = buildEl("input", "loc-search", locBody);
  locSearch.type = "search";
  locSearch.placeholder = t('searchPlaceholder');
  locSearch.disabled = true;

  const locList = buildEl("div", "loc-list", locBody);
  locList.style.opacity = "0.6";

  const pickedBox = buildEl("div", "loc-picked", locBody);
  pickedBox.textContent = t('selection') + ": —";
  const pickedSmall = buildEl("span", "small", pickedBox);
  pickedSmall.textContent = "";

  const locRow2 = buildEl("div", "loc-row", locBody);
  const locSaveBtn = buildEl("button", "btn", locRow2);
  locSaveBtn.type = "button";
  locSaveBtn.textContent = t('save');
  locSaveBtn.disabled = true;

  let selectedPlace = null;

  function openLocModal() {
    locOverlay.style.display = "flex";
  }
  function closeLocModal() {
    locOverlay.style.display = "none";
  }
  locClose.addEventListener("click", closeLocModal);
  locOverlay.addEventListener("click", (e) => {
    if (e.target === locOverlay) closeLocModal();
  });

  function setPicked(place) {
    selectedPlace = place;
    if (!place) {
      pickedBox.firstChild.textContent = `${t('selection')}: —`;
      pickedSmall.textContent = "";
      locSaveBtn.disabled = true;
      return;
    }
    pickedBox.firstChild.textContent = `${t('selection')}: ${placeLabel(place) || "—"}`;
    pickedSmall.textContent = place.displayName ? place.displayName : "";
    locSaveBtn.disabled = !(place.lat != null && place.lon != null);
  }

  function renderCityFallback(q) {
    locList.innerHTML = "";
    locList.style.opacity = "1";

    const qq = (q || "").trim().toLowerCase();
    const rows = cities
      .filter((c) => (qq ? c.name.toLowerCase().includes(qq) : true))
      .slice(0, 40);

    for (const c of rows) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn";
      b.style.textAlign = "left";
      b.style.padding = "10px 12px";
      b.style.borderRadius = "14px";
      b.textContent = c.name;
      b.addEventListener("click", () => {
        setPicked({
          cityName: c.name,
          districtName: null,
          neighborhoodName: null,
          displayName: c.name,
          osmType: "fallback",
          osmId: `tr-city:${c.name}`,
          lat: Number(c.lat),
          lon: Number(c.lon),
        });
      });
      locList.appendChild(b);
    }
  }

  function renderSearchResults(items) {
    locList.innerHTML = "";
    locList.style.opacity = "1";

    if (!Array.isArray(items) || items.length === 0) {
      const d = document.createElement("div");
      d.style.opacity = "0.85";
      d.style.fontWeight = "900";
      d.style.fontSize = "13px";
      d.textContent = t('noResults');
      locList.appendChild(d);
      return;
    }

    for (const it of items) {
      const place = extractPlaceFromNominatim(it);

      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn";
      b.style.textAlign = "left";
      b.style.padding = "10px 12px";
      b.style.borderRadius = "14px";
      b.textContent = place.displayName || placeLabel(place) || "—";

      b.addEventListener("click", () => setPicked(place));
      locList.appendChild(b);
    }
  }

  // Debounce search
  let searchTimer = null;
  async function doSearch(q) {
    try {
      const data = await nominatimFetch("/search", { q, limit: "12" });
      renderSearchResults(data);
    } catch (e) {
      log(t('locSearchFailed') + `: ${String(e?.message || e)}`);
      renderCityFallback(q);
    }
  }

  locSearch.addEventListener("input", () => {
    const q = (locSearch.value || "").trim();
    if (searchTimer) clearTimeout(searchTimer);
    if (q.length < 3) {
      locList.innerHTML = "";
      locList.style.opacity = "0.6";
      setPicked(null);
      return;
    }
    searchTimer = setTimeout(() => doSearch(q), 250);
  });

  locManualBtn.addEventListener("click", () => {
    locSearch.disabled = false;
    locSearch.focus();
    locList.innerHTML = "";
    locList.style.opacity = "0.6";
    setPicked(null);
  });

  locGpsBtn.addEventListener("click", async () => {
    try {
      log(t('locGpsRequesting'));
      const pos = await tryGetGpsOnce({ timeoutMs: 9000 });
      const data = await nominatimFetch("/reverse", {
        lat: String(pos.lat),
        lon: String(pos.lon),
        zoom: "18",
      });
      const place = extractPlaceFromNominatim(data);
      if (!place || place.lat == null || place.lon == null) throw new Error("reverse empty");
      setPicked(place);
      locSaveBtn.disabled = false;
      log(t('locGpsSuccess') + `: ${placeLabel(place)}`);
    } catch (e) {
      log(t('locGpsFailed') + ` (${String(e?.message || e)})`);
      locSearch.disabled = false;
      locSearch.focus();
    }
  });

  locSaveBtn.addEventListener("click", async () => {
    if (!selectedPlace) return;

    safeSetPlace({
      cityName: selectedPlace.cityName || null,
      districtName: selectedPlace.districtName || null,
      neighborhoodName: selectedPlace.neighborhoodName || null,
      displayName: selectedPlace.displayName || null,
      osmType: selectedPlace.osmType || null,
      osmId: selectedPlace.osmId || null,
      lat: selectedPlace.lat,
      lon: selectedPlace.lon,
    });

    localState.cityName = selectedPlace.cityName || "Konumum";
    localState.districtName = selectedPlace.districtName || null;
    localState.neighborhoodName = selectedPlace.neighborhoodName || null;
    localState.obsLat = Number(selectedPlace.lat);
    localState.obsLon = Number(selectedPlace.lon);

    syncCityText();
    log(t('locSaved') + `: ${placeLabel(selectedPlace)}`);
    showToast(t('locSaved') || "Location Saved", 'success');

    closeLocModal();
    await calcPredictionNow({ forceLog: true });
    renderPrediction();
  });

  // load saved place
  const saved = safeGetPlace();
  if (saved?.cityName || saved?.displayName) {
    localState.cityName = saved.cityName || "Konumum";
    localState.districtName = saved.districtName || null;
    localState.neighborhoodName = saved.neighborhoodName || null;
    localState.obsLat = Number.isFinite(saved.lat) ? saved.lat : null;
    localState.obsLon = Number.isFinite(saved.lon) ? saved.lon : null;
  }
  syncCityText();

  // ---------- Telemetry ----------
  // UI tick (countdown)
  let uiTickTimer = null;
  function startUiTick() {
    if (uiTickTimer) clearInterval(uiTickTimer);
    uiTickTimer = setInterval(() => {
      renderPrediction();
      const now = Date.now();
      const every = Number(CONFIG?.INTERVAL_PREDICTION_REFRESH ?? 60000);
      if (now - localState.lastPredictionRefresh > every && !localState.predictionBusy) {
        calcPredictionNow().then(() => renderPrediction());
      }
    }, Number(CONFIG?.INTERVAL_UI_TICK ?? 1000));
  }

  // ---------- ISS Motion & Telemetry (v0.3.3) ----------
  function handleMotionUpdate({ lat, lng, alt }) {
    // 1. Update Map Marker (interpolated)
    mapView.updateISSPosition(lat, lng);

    // 2. Update 3D Globe (interpolated)
    if (viewMode === "3d" && globe) {
      try { globe.setIssPosition(lat, lng); } catch { }
    }

    // 3. Follow/Tracking Logic
    if (trackEnabled) {
      const now = Date.now();
      const minInterval = Number(CONFIG?.FOLLOW_PAN_INTERVAL_MS ?? 2500); // 2.5s for smoother feel
      if (now - lastPanAt >= minInterval) {
        lastPanAt = now;
        // Use current zoom level for better UX
        mapView.panTo(lat, lng, map.getZoom());
      }
    }
  }

  function handleNewData(data) {
    // 1. Update HUD (Velocity/Alt/etc)
    // Mark data as received (for staleness tracking)
    networkStatus.markDataReceived();
    dashboard.update({
      altitude: data.altKm,
      velocity: data.velKmh,
      latitude: data.lat,
      longitude: data.lon,
      visibility: "daylight" // Todo: connect to real visibility calc if needed
    });

    // 2. Update Local State
    localState.lastIssLat = data.lat;
    localState.lastIssLon = data.lon;
    localState.lastTelemetryAt = data.ts;

    // 3. Refresh Weather
    refreshWeatherForIss(data.lat, data.lon);

    if (!localState.prediction && Number.isFinite(localState.obsLat)) {
      calcPredictionNow().catch(() => { });
    }
  }

  // NOTE: Motion system started below in unified block (line ~1191)
  // Removed duplicate startMotion call to prevent double initialization

  renderPrediction();
  startUiTick();

  // ---------- Trajectory Visualization ----------
  let trajectoryTimer = null;
  let lastTrajectoryUpdateAt = 0;
  let cachedTrajectory = null; // Cache for 3D mode switching

  async function updateTrajectoryOnMap() {
    try {
      const now = Date.now();
      // Minimum 45 seconds between updates
      if (now - lastTrajectoryUpdateAt < 45 * 1000) return;
      lastTrajectoryUpdateAt = now;

      log('[Trajectory] Hesaplanıyor...');
      const trajectory = await calculateTrajectory({
        pastMinutes: 45,
        futureMinutes: 90,
        stepSeconds: 30  // 30 second steps for smooth line
      });

      console.log('[Trajectory] Raw data:', trajectory);

      // Cache trajectory for 3D mode switching
      cachedTrajectory = trajectory;

      // Convert to GeoJSON for 2D MapLibre
      const pastGeoJSON = trajectoryToGeoJSON(trajectory.past);
      const futureGeoJSON = trajectoryToGeoJSON(trajectory.future);

      console.log('[Trajectory] Past GeoJSON features:', pastGeoJSON?.geometry?.coordinates?.length || 0);
      console.log('[Trajectory] Future GeoJSON features:', futureGeoJSON?.geometry?.coordinates?.length || 0);

      // Update 2D MapLibre
      if (mapView && mapView.updateTrajectory) {
        mapView.updateTrajectory(pastGeoJSON, futureGeoJSON);
      } else {
        console.warn('[Trajectory] mapView or updateTrajectory not available');
      }

      // Update 3D Globe (if loaded)
      if (globe && globe.updateTrajectory) {
        globe.updateTrajectory(trajectory.past, trajectory.future);
      }

      log(`[Trajectory] ✅ ${trajectory.past.length} geçmiş + ${trajectory.future.length} gelecek nokta`);
    } catch (e) {
      console.error('[Trajectory] Error:', e);
      log(t('trajectoryError') + `: ${e?.message || e}`);
    }
  }

  // Apply cached trajectory to globe when 3D mode is enabled
  function applyTrajectoryToGlobe() {
    if (cachedTrajectory && globe && globe.updateTrajectory) {
      globe.updateTrajectory(cachedTrajectory.past, cachedTrajectory.future);
      // console.log('[Trajectory] Applied to 3D Globe');
    }
  }
  window._applyTrajectoryToGlobe = applyTrajectoryToGlobe;

  // Initial trajectory calculation (handle race condition)
  // Map might already be loaded by the time this code runs
  if (mapView && mapView.map) {
    if (mapView.map.loaded()) {
      // Map already loaded, calculate immediately
      // console.log('[Trajectory] Map already loaded, calculating immediately...');
      updateTrajectoryOnMap();
    } else {
      // Map not loaded yet, wait for load event
      mapView.map.once('load', () => {
        // console.log('[Trajectory] Map loaded, calculating initial trajectory...');
        updateTrajectoryOnMap();
      });
    }
  }

  // Refresh trajectory every 1 minute
  trajectoryTimer = setInterval(() => {
    updateTrajectoryOnMap();
  }, 1 * 60 * 1000);

  // ========== SMOOTH MOTION SYSTEM ==========
  // 2D: Native marker updated on data arrival (sticky during pan)
  // 3D: 60fps lerp for smooth orbit visualization
  startMotion({
    // Called every frame (60fps) - ONLY for 3D globe smooth interpolation
    onPosition: (pos) => {
      const la = clampLat(pos.lat);
      const lo = normalizeLon(pos.lng);

      // Update ONLY 3D globe at 60fps (WebGL mesh needs lerp)
      if (viewMode === "3d" && globe) {
        try { globe.setIssPosition(la, lo); } catch { }
      }

      // Store for other systems
      localState.lastIssLat = la;
      localState.lastIssLon = lo;
    },

    // Called when new API data arrives (every 3s)
    onData: (data) => {
      if (!data) return;

      const la = clampLat(data.lat);
      const lo = normalizeLon(data.lon);

      // Update 2D marker ONLY on data arrival (native = sticky during pan)
      if (viewMode === "2d") {
        mapView.updateISSPosition(la, lo);
      }

      // Update Docked Dashboard
      dashboard.update({
        altitude: data.altKm,
        velocity: data.velKmh || 27580,
        latitude: data.lat,
        longitude: data.lon,
        visibility: "daylight" // Default, API may provide this
      });

      const now = new Date();
      termSub.textContent = `Son güncelleme: ${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())} [${data.source}]`;

      // Periodic log (every 10s)
      const logEvery = Number(CONFIG?.TERMINAL_TELEMETRY_LOG_INTERVAL_MS ?? 10000);
      const nowMs = Date.now();
      if (nowMs - localState.lastTelemetryLogAt >= logEvery) {
        localState.lastTelemetryLogAt = nowMs;
        log(`ISS lat=${fmtNum(data.lat, 2)} lon=${fmtNum(data.lon, 2)} alt=${fmtNum(data.altKm, 1)}km [${data.source}]`);
      }

      // Weather refresh
      refreshWeatherForIss(data.lat, data.lon);

      // Auto-pan if tracking enabled
      if (trackEnabled && viewMode === "2d") {
        const nowPan = Date.now();
        const minInterval = Number(CONFIG?.FOLLOW_PAN_INTERVAL_MS ?? 4000);
        if (nowPan - lastPanAt >= minInterval) {
          lastPanAt = nowPan;
          mapView.panTo(data.lat, data.lon, 4);
        }
      }
    }
  });

  log('[Motion] 🛰️ Motion system started (2D: native sticky, 3D: 60fps lerp)');

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      try {
        // Stop motion system
        import("../services/issMotion.js").then(m => m.stopMotion());
        clearInterval(uiTickTimer);
      } catch { }
      try {
        map.remove();
      } catch { }
    });
  }

  // ---------- Mobile Navigation Bar ----------
  const mobileNav = createMobileNavBar({
    onChange: (tabId) => {
      document.body.setAttribute('data-mobile-view', tabId);

      // Toggle section visibility based on active tab
      // nasaSection.style.display = tabId === 'nasa' ? 'block' : 'none'; // NASA disabled
      // passSection.style.display = tabId === 'passes' ? 'block' : 'none'; // Pass card disabled
      dashboard.el.style.display = tabId === 'telemetry' ? 'flex' : 'none';

      // Pause/resume NASA video when not visible
      // NASA card is temporarily disabled
      /*
      if (tabId !== 'nasa') {
        // Videos are in iframes, they auto-manage when hidden
      }
      */
    },
    onSettings: () => settingsModal.open()
  });
  rootEl.appendChild(mobileNav.el);

  // Enable mobile mode class for CSS hooks (media query handles activation)
  document.body.classList.add('mobile-mode');
  document.body.setAttribute('data-mobile-view', 'map');

  log(t('bootReady'));

  // Show location welcome for first-time users
  setTimeout(() => {
    showLocationWelcome(
      (location) => {
        log(t('locationSet') + `: ${location.displayName}`);
        // Optionally recalculate predictions with new location
        if (location.lat && location.lon) {
          // Could trigger prediction recalculation here
        }
      },
      () => {
        // Manual entry - open city selection modal
        openLocModal();
      }
    );
  }, 1000); // Small delay to let UI settle

  // Phase 7: Network Feedback
  window.addEventListener('offline', () => {
    // showToast(`${t('connectionLost')} • ${t('staleData')}`, 'error'); // Removed as per user request
    networkStatus.setOffline(true);
  });

  window.addEventListener('online', () => {
    showToast(t('connectionRestored') || "⚡ Connection Restored", 'success');
    networkStatus.setOffline(false);
  });
}
