// src/app/boot.js
// TR: Uygulamanın giriş noktası. UI + harita + telemetry + pass prediction + 2D/3D toggle.

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { CONFIG } from "../constants/config.js";
import cities from "../assets/cities.tr.json";

import { computePassBundle } from "../services/prediction.js";
import { createViewModeToggle, getInitialViewMode } from "../ui/viewModeToggleView.js";
import { createWeatherBadge } from "../ui/weatherBadgeView.js";
import { fetchCurrentWeather, weatherCodeLabel } from "../services/weather.js";
import { createThemePicker, applyGlassColor, getGlassColor } from "../ui/themePickerView.js";

import { openCrewModal } from "../ui/crewWidgetView.js";

// Leaflet marker default icon fix (Vite + Leaflet klasik)
import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import icon1x from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

// WhereTheISS.at
const ISS_URL = "https://api.wheretheiss.at/v1/satellites/25544";

// ------- Leaflet icon fix -------
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon2x,
  iconUrl: icon1x,
  shadowUrl: shadow,
});

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
  const saved = localStorage.getItem(key);
  const valid = saved === "light" || saved === "dark" || saved === "system";
  return valid ? saved : (CONFIG?.DEFAULT_THEME || "system");
}

function setThemeMode(mode) {
  const key = CONFIG?.THEME_STORAGE_KEY || "issThemeMode";
  localStorage.setItem(key, mode);
  return applyTheme(mode);
}

// ------- Skin (cyberpunk/liquid/realistic) -------
const SKIN_KEY = "isshub:skin";
function getInitialSkin() {
  const v = localStorage.getItem(SKIN_KEY);
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
  localStorage.setItem(SKIN_KEY, skin);
  applySkin(skin);
}

// ------- Yer/konum yardımcıları -------
const PLACE_STORAGE_KEY = "isshub:place_v2";

function safeGetPlace() {
  try {
    const raw = localStorage.getItem(PLACE_STORAGE_KEY);
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
    localStorage.setItem(PLACE_STORAGE_KEY, JSON.stringify(place));
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
export function boot(store, rootEl) {
  if (!rootEl) throw new Error("rootEl missing");

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
  logo.setAttribute("aria-hidden", "true");

  const title = buildEl("div", "hub-title", brand);
  const t = buildEl("div", "t", title);
  t.textContent = "ISS Tracker HUB";
  const s = buildEl("div", "s", title);
  s.textContent = "alpha";

  const actions = buildEl("div", "hub-actions", topbar);

  const followPill = buildEl("div", "hub-pill", actions);
  const followDot = buildEl("div", "hub-dot", followPill);
  const followTxt = buildEl("div", "", followPill);
  followTxt.textContent = "Takip: Açık";

  // Skin select (✅ fixed)
  const skinSelect = document.createElement("select");
  skinSelect.innerHTML = `
    <option value="realistic">Skin: Realistic</option>
    <option value="liquid">Skin: Liquid</option>
    <option value="cyberpunk">Skin: Cyberpunk</option>
  `;
  const initialSkin = getInitialSkin();
  skinSelect.value = initialSkin;
  actions.appendChild(skinSelect);

  // Theme button (system/dark/light)
  const themeBtn = buildEl("button", "btn", actions);
  themeBtn.type = "button";
  themeBtn.textContent = "Tema: Sistem";

  const cityBtn = buildEl("button", "btn", actions);
  cityBtn.type = "button";
  cityBtn.textContent = "Şehir Seç";

  const crewBtn = buildEl("button", "btn", actions);
  crewBtn.type = "button";
  crewBtn.textContent = "Mürettebat";

  const colorBtn = buildEl("button", "btn", actions);
  colorBtn.type = "button";
  colorBtn.textContent = "🎨 Renk";
  colorBtn.title = "Cam rengini değiştir";

  crewBtn.addEventListener("click", () => openCrewModal());

  // Theme picker modal
  const themePicker = createThemePicker();
  rootEl.appendChild(themePicker.el);

  colorBtn.addEventListener("click", () => {
    themePicker.open();
  });

  // Apply initial theme/skin/glass color
  let themeMode = getInitialThemeMode();
  let resolvedTheme = setThemeMode(themeMode);
  applySkin(initialSkin);
  applyGlassColor(getGlassColor()); // Kaydedilmiş rengi uygula

  skinSelect.addEventListener("change", () => {
    setSkin(skinSelect.value);
  });

  function updateThemeButton() {
    const label = themeMode === "system" ? "Sistem" : themeMode === "dark" ? "Koyu" : "Açık";
    themeBtn.textContent = `Tema: ${label}`;
  }
  updateThemeButton();

  themeBtn.addEventListener("click", () => {
    themeMode = themeMode === "system" ? "dark" : themeMode === "dark" ? "light" : "system";
    resolvedTheme = setThemeMode(themeMode);
    updateThemeButton();
    updateTileTheme();
    log(`Tema değişti: ${themeMode} (${resolvedTheme})`);
  });

  // HUD cards
  const cards = buildEl("div", "hub-cards", overlay);

  const card1 = buildEl("div", "card hub-glass", cards);
  const row1 = buildEl("div", "row", card1);
  const mSpeedK = buildEl("div", "k", row1);
  mSpeedK.textContent = "Hız (km/h)";
  const mSpeedV = buildEl("div", "v", row1);
  mSpeedV.textContent = "--";
  const sub1 = buildEl("div", "sub", card1);
  sub1.innerHTML = `Konum: <strong id="pos">--</strong>`;

  const card2 = buildEl("div", "card hub-glass", cards);
  const row2 = buildEl("div", "row", card2);
  const mAltK = buildEl("div", "k", row2);
  mAltK.textContent = "Yükseklik (km)";
  const mAltV = buildEl("div", "v", row2);
  mAltV.textContent = "--";
  const sub2 = buildEl("div", "sub", card2);
  sub2.innerHTML = `Şehrim: <strong id="city">Konumum</strong>`;

  const card3 = buildEl("div", "card hub-glass", cards);
  const row3 = buildEl("div", "row", card3);
  const mPosK = buildEl("div", "k", row3);
  mPosK.textContent = "Lat / Lon";
  const mPosV = buildEl("div", "v", row3);
  mPosV.textContent = "--";

  const pass = buildEl("div", "card hub-glass", cards);
  const passRow = buildEl("div", "row", pass);
  const passK = buildEl("div", "k", passRow);
  passK.textContent = "En Yakın Geçiş";
  const passTimer = buildEl("div", "v", passRow);
  passTimer.textContent = "--:--:--";

  const passBadge = buildEl("div", "pass-badge", pass);
  const passBadgeDot = buildEl("div", "b", passBadge);
  const passBadgeText = buildEl("div", "", passBadge);
  passBadgeText.textContent = "—";

  const passMeta = buildEl("div", "pass-meta", pass);
  passMeta.textContent = "—";

  const passMini = buildEl("div", "pass-mini", pass);
  passMini.textContent = "";

  // Terminal (log)
  const terminal = buildEl("div", "hub-terminal hub-glass", rootEl);
  const termHead = buildEl("div", "term-head", terminal);
  const termTitle = buildEl("div", "term-title", termHead);
  termTitle.textContent = "Terminal";
  const termSub = buildEl("div", "term-sub", termHead);
  termSub.textContent = "Son güncelleme: --:--:--";

  const termBody = buildEl("div", "term-body", terminal);
  termBody.textContent = "";

  const logLines = [];
  function log(line) {
    const ts = new Date();
    const stamp = `${pad2(ts.getHours())}:${pad2(ts.getMinutes())}:${pad2(ts.getSeconds())}`;
    const msg = `[${stamp}] ${line}`;
    logLines.push(msg);
    if (logLines.length > 200) logLines.shift();
    termBody.textContent = logLines.join("\n"); // ✅ XSS yok
    termBody.scrollTop = termBody.scrollHeight;
  }

  // Version label
  const version = buildEl("div", "hub-ver", rootEl);
  version.textContent = CONFIG?.VERSION || "v0.1-alpha";

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
    const cityEl = card2.querySelector("#city");
    if (!cityEl) return;
    cityEl.textContent = placeLabel({
      cityName: localState.cityName,
      districtName: localState.districtName,
      neighborhoodName: localState.neighborhoodName,
    });
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

  async function calcPredictionNow({ forceLog = false } = {}) {
    const lat = localState.obsLat;
    const lon = localState.obsLon;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      if (forceLog) log("pass> konum yok: geçiş hesabı yapılamadı");
      return;
    }
    if (localState.predictionBusy) return;

    localState.predictionBusy = true;
    try {
      log(`pass> hesaplanıyor… (obs=${fmtNum(lat, 3)},${fmtNum(lon, 3)})`);
      const bundle = await computePassBundle({ obsLat: lat, obsLon: lon });
      const nextPass = bundle?.nextPass || null;

      setPredictionFromPass(nextPass);
      localState.lastPredictionRefresh = Date.now();

      if (!nextPass) {
        log("pass> 36 saat içinde geçiş bulunamadı");
      } else {
        log(
          `pass> bulundu: AOS=${new Date(nextPass.aosMs).toLocaleTimeString()} LOS=${new Date(
            nextPass.losMs
          ).toLocaleTimeString()} MAX=${Math.round(nextPass.maxElev)}° ${nextPass.visible ? "✅" : "🔴"}`
        );
      }
    } catch (e) {
      log(`pass> HATA: ${String(e?.message || e)}`);
      localState.prediction = null;
    } finally {
      localState.predictionBusy = false;
    }
  }

  function renderPrediction() {
    const p = localState.prediction;
    if (!p) {
      passTimer.textContent = "--:--:--";
      passBadgeDot.style.background = "var(--bad)";
      passBadgeText.textContent = "—";
      passMeta.textContent = "—";
      passMini.textContent = "";
      return;
    }

    const now = Date.now();
    const msLeft = Math.max(0, p.aosMs - now);
    passTimer.textContent = fmtHMS(msLeft);

    const ok = Boolean(p.visible);
    passBadgeDot.style.background = ok ? "var(--good)" : "var(--bad)";
    passBadgeText.textContent = ok ? "✅ GÖRÜNÜR" : `🔴 GÖRÜNMEZ (${p.reason || "—"})`;

    const aos = new Date(p.aosMs);
    const los = new Date(p.losMs);
    const aosStr = `${pad2(aos.getHours())}:${pad2(aos.getMinutes())}`;
    const losStr = `${pad2(los.getHours())}:${pad2(los.getMinutes())}`;
    passMeta.textContent = `AOS ${aosStr} • LOS ${losStr} • MAX ${Math.round(p.maxElevDeg)}°`;

    passMini.textContent = p.hint ? p.hint : "";
  }

  // ------- Leaflet map -------
  const map = L.map(mapEl, {
    zoomControl: false,
    attributionControl: false,
  }).setView(CONFIG?.DEFAULT_CENTER || [39, 35], CONFIG?.DEFAULT_ZOOM || 4);

  const tileLight = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
  });
  const tileDark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 18,
  });

  function updateTileTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    if (current === "light") {
      try { map.removeLayer(tileDark); } catch { }
      try { tileLight.addTo(map); } catch { }
    } else {
      try { map.removeLayer(tileLight); } catch { }
      try { tileDark.addTo(map); } catch { }
    }
  }
  updateTileTheme();

  // Track mode
  const issIcon = L.divIcon({
    className: "",
    html: `<div style="
      width:18px;height:18px;border-radius:999px;
      background: rgba(45,212,191,0.95);
      box-shadow: 0 0 0 4px rgba(45,212,191,0.18), 0 8px 24px rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.25);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  const marker = L.marker([0, 0], { icon: issIcon }).addTo(map);

  let trackEnabled = true;
  let lastPanLatLng = null;
  let lastPanAt = 0;

  const trackPolyline = L.polyline([], { weight: 2, opacity: 0.9 }).addTo(map);

  // ---------- 2D / 3D ----------
  let viewMode = getInitialViewMode(); // "2d" | "3d"
  let globe = null;
  let globeLoading = false;
  let viewToggleRef = null;

  function setFollowUI(on) {
    trackEnabled = Boolean(on);
    followDot.style.opacity = on ? "1" : "0.35";
    followTxt.textContent = on ? "Takip: Açık" : "Takip: Kapalı";
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
      globe = await mod.createGlobe(rootEl);
      // Skin uygulanmış olsun
      applySkin(getInitialSkin());
      return globe;
    } catch (e) {
      log(`3D globe yüklenemedi: ${e?.message || e}`);
      try { globe?.setVisible(false); } catch { }
      globe = null;
      return null;
    } finally {
      globeLoading = false;
    }
  }

  function applyViewMode(mode) {
    viewMode = mode === "3d" ? "3d" : "2d";
    mapEl.style.display = viewMode === "2d" ? "block" : "none";

    if (viewMode === "3d") {
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
        })
        .catch((e) => {
          log(`3D globe hatası: ${e?.message || e}`);
          mapEl.style.display = "block";
          try { viewToggleRef?.setMode("2d"); } catch { }
        });
    } else {
      try { globe?.setVisible(false); } catch { }
      // 2D'ye geçerken globe takibini durdur
      try { globe?.stopFollow(); } catch { }
    }

    if (viewMode === "2d") {
      setTimeout(() => {
        try { map.invalidateSize(false); } catch { }
      }, 0);
    }
  }

  const viewToggle = createViewModeToggle({
    initialMode: viewMode,
    onChange: (m) => applyViewMode(m),
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

  cityBtn.addEventListener("click", () => {
    openLocModal();
  });

  // ---------- Location Modal (OSM/Nominatim) ----------
  const locOverlay = buildEl("div", "loc-overlay", rootEl);
  const locCard = buildEl("div", "loc-card hub-glass", locOverlay);

  const locTop = buildEl("div", "loc-top", locCard);
  const locTitle = buildEl("div", "loc-title", locTop);
  locTitle.textContent = "Yer Seçimi (OSM)";
  const locClose = buildEl("button", "btn", locTop);
  locClose.type = "button";
  locClose.textContent = "Kapat";

  const locBody = buildEl("div", "loc-body", locCard);

  const locDesc = buildEl("div", "", locBody);
  locDesc.style.fontWeight = "900";
  locDesc.style.opacity = "0.9";
  locDesc.textContent =
    "Geçiş hesabı seçtiğin konuma göre yapılır. Kaydedince 'En Yakın Geçiş' otomatik hesaplanır.";

  const locRow = buildEl("div", "loc-row", locBody);
  const locGpsBtn = buildEl("button", "btn", locRow);
  locGpsBtn.type = "button";
  locGpsBtn.textContent = "Konumumu Kullan (GPS)";
  const locManualBtn = buildEl("button", "btn", locRow);
  locManualBtn.type = "button";
  locManualBtn.textContent = "Arama ile Seç";

  const locSearch = buildEl("input", "loc-search", locBody);
  locSearch.type = "search";
  locSearch.placeholder = "Ara: “Bursa Osmangazi” / “Istanbul Kadikoy” …";
  locSearch.disabled = true;

  const locList = buildEl("div", "loc-list", locBody);
  locList.style.opacity = "0.6";

  const pickedBox = buildEl("div", "loc-picked", locBody);
  pickedBox.textContent = "Seçim: —";
  const pickedSmall = buildEl("span", "small", pickedBox);
  pickedSmall.textContent = "";

  const locRow2 = buildEl("div", "loc-row", locBody);
  const locSaveBtn = buildEl("button", "btn", locRow2);
  locSaveBtn.type = "button";
  locSaveBtn.textContent = "Kaydet";
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
      pickedBox.firstChild.textContent = "Seçim: —";
      pickedSmall.textContent = "";
      locSaveBtn.disabled = true;
      return;
    }
    pickedBox.firstChild.textContent = `Seçim: ${placeLabel(place) || "—"}`;
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
      d.textContent = "Sonuç yok. Daha genel yaz (örn: “Bursa”).";
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
      log(`loc> Nominatim arama başarısız: ${String(e?.message || e)}`);
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
      log("loc> GPS isteniyor…");
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
      log(`loc> GPS reverse ok: ${placeLabel(place)}`);
    } catch (e) {
      log(`loc> GPS/Reverse başarısız (${String(e?.message || e)})`);
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
    log(`loc> kaydedildi: ${placeLabel(selectedPlace)}`);

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
  async function fetchTelemetry() {
    const res = await fetch(ISS_URL, { cache: "no-store" });
    const txt = await res.text();
    const data = safeJsonParse(txt);
    if (!data) throw new Error("bad json");

    const tel = {
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      altitude: Number(data.altitude),
      velocity: Number(data.velocity),
      timestamp: Number(data.timestamp) * 1000,
    };

    if (
      Number.isNaN(tel.latitude) ||
      Number.isNaN(tel.longitude) ||
      Number.isNaN(tel.altitude) ||
      Number.isNaN(tel.velocity)
    ) {
      throw new Error("bad telemetry");
    }
    return tel;
  }

  function renderTelemetry(tel) {
    mSpeedV.textContent = fmtInt(tel.velocity);
    mAltV.textContent = fmtNum(tel.altitude, 1);
    mPosV.textContent = `${fmtNum(tel.latitude, 2)} / ${fmtNum(tel.longitude, 2)}`;

    const posEl = card1.querySelector("#pos");
    if (posEl) posEl.textContent = `${fmtNum(tel.latitude, 2)} / ${fmtNum(tel.longitude, 2)}`;

    syncCityText();

    const la = clampLat(tel.latitude);
    const lo = normalizeLon(tel.longitude);
    localState.lastIssLat = la;
    localState.lastIssLon = lo;

    const latlng = L.latLng(la, lo);
    marker.setLatLng(latlng);

    // 3D (açıksa)
    try {
      if (viewMode === "3d") globe?.setIssPosition(la, lo);
    } catch { }

    // weather
    refreshWeatherForIss(la, lo);

    // trail
    trackPolyline.addLatLng(latlng);
    const pts = trackPolyline.getLatLngs();
    if (pts.length > 600) trackPolyline.setLatLngs(pts.slice(-600));

    // follow pan throttle
    if (trackEnabled) {
      const now = Date.now();
      const minInterval = Number(CONFIG?.FOLLOW_PAN_INTERVAL_MS ?? 4000);
      const minDistM = Number(CONFIG?.FOLLOW_PAN_MIN_DISTANCE_M ?? 30000);

      const canTime = now - lastPanAt >= minInterval;
      const distOk = !lastPanLatLng ? true : map.distance(lastPanLatLng, latlng) >= minDistM;

      const reduceMotion =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (canTime && distOk) {
        lastPanAt = now;
        lastPanLatLng = latlng;
        map.panTo(latlng, { animate: !reduceMotion, duration: 0.25 });
      }
    }
  }

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

  async function refreshOnce() {
    try {
      const tel = await fetchTelemetry();
      renderTelemetry(tel);

      localState.lastTelemetryAt = Date.now();
      const u = new Date(localState.lastTelemetryAt);
      termSub.textContent = `Son güncelleme: ${pad2(u.getHours())}:${pad2(u.getMinutes())}:${pad2(
        u.getSeconds()
      )}`;

      const logEvery = Number(CONFIG?.TERMINAL_TELEMETRY_LOG_INTERVAL_MS ?? 10000);
      const nowLog = Date.now();
      if (nowLog - localState.lastTelemetryLogAt >= logEvery) {
        localState.lastTelemetryLogAt = nowLog;
        log(
          `ISS lat=${fmtNum(tel.latitude, 2)} lon=${fmtNum(tel.longitude, 2)} alt=${fmtNum(
            tel.altitude,
            1
          )}km v=${fmtInt(tel.velocity)}km/h`
        );
      }

      if (!localState.prediction && Number.isFinite(localState.obsLat) && Number.isFinite(localState.obsLon)) {
        await calcPredictionNow({ forceLog: false });
        renderPrediction();
      }
    } catch (e) {
      log(`HATA: telemetri alınamadı (${String(e?.message || e)})`);
    }
  }

  renderPrediction();
  refreshOnce();
  startUiTick();

  const interval = Number(CONFIG?.INTERVAL_TELEMETRY_FETCH ?? 2000);
  const timer = setInterval(refreshOnce, interval);

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      try {
        clearInterval(timer);
        clearInterval(uiTickTimer);
      } catch { }
      try {
        map.remove();
      } catch { }
    });
  }

  log("boot> hazır");
}
