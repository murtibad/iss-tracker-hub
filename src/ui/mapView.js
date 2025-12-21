// src/ui/mapView.js
// TR: Leaflet map + ISS marker + takip modu + path
// EN: Leaflet map + ISS marker + follow mode + path

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CONFIG } from "../constants/config.js";

function clampLat(lat) {
  return Math.max(-85, Math.min(85, lat));
}

function normalizeLon(lon) {
  let x = lon;
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  return x;
}

export function createMap(rootEl) {
  const mapWrap = document.createElement("div");
  mapWrap.style.position = "fixed";
  mapWrap.style.inset = "0";
  mapWrap.style.zIndex = "0"; // UI üstte kalsın
  mapWrap.style.pointerEvents = "auto";

  const mapEl = document.createElement("div");
  mapEl.style.width = "100%";
  mapEl.style.height = "100%";
  mapWrap.append(mapEl);
  rootEl.append(mapWrap);

  const map = L.map(mapEl, {
    zoomControl: true,
    worldCopyJump: true,
    preferCanvas: true,
  }).setView(CONFIG.DEFAULT_CENTER, CONFIG.DEFAULT_ZOOM);

  const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 8,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  // TR: glass.css harita filtresi için tilePane'e class ekliyoruz
  const tilePane = map.getPane("tilePane");
  if (tilePane) tilePane.classList.add("iss-tile-pane");

  const marker = L.circleMarker([0, 0], {
    radius: 8,
    color: "#67e8f9",
    weight: 2,
    fillColor: "#2dd4bf",
    fillOpacity: 0.9,
  }).addTo(map);

  const path = L.polyline([], {
    weight: 2,
    opacity: 0.9,
    color: "#3aa0ff",
  }).addTo(map);

  let follow = true;
  const followListeners = [];

  // TR: Jank azaltma için pan throttle
  let lastPanAt = 0;
  let lastPanLatLng = null;

  function setFollowMode(v) {
    follow = Boolean(v);
    followListeners.forEach((fn) => fn(follow));
  }

  function getFollowMode() {
    return follow;
  }

  function onFollowChange(fn) {
    followListeners.push(fn);
    fn(follow);
  }

  function ensureMapSized() {
    // TR: Leaflet bazen container ölçüsünü 0/yanlış alır → harita yarım render olur.
    // Bu yüzden birkaç kez invalidateSize çağırıyoruz.
    try {
      map.invalidateSize(false);
    } catch {
      // sessiz
    }
  }

  // İlk açılışta: 1 frame sonra + kısa timeout ile “tam oturt”
  requestAnimationFrame(() => ensureMapSized());
  setTimeout(() => ensureMapSized(), 60);
  setTimeout(() => ensureMapSized(), 250);

  // Pencere boyutu değişince
  window.addEventListener("resize", () => {
    setTimeout(() => ensureMapSized(), 0);
  });

  // Sekmeye geri dönünce (visibility change)
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      setTimeout(() => ensureMapSized(), 0);
    }
  });

  // Tema/skin değişince (tile filtreleri vs. için)
  window.addEventListener("iss:themechange", () => {
    const p = map.getPane("tilePane");
    if (p) p.classList.add("iss-tile-pane");
    setTimeout(() => ensureMapSized(), 0);
  });

  function setIssPosition(lat, lon) {
    const la = clampLat(lat);
    const lo = normalizeLon(lon);

    const ll = L.latLng(la, lo);
    marker.setLatLng(ll);

    if (!follow) return;

    const now = Date.now();
    const minInterval = Number(CONFIG?.FOLLOW_PAN_INTERVAL_MS ?? 4000);
    const minDistM = Number(CONFIG?.FOLLOW_PAN_MIN_DISTANCE_M ?? 30000);

    const okTime = now - lastPanAt >= minInterval;
    const okDist = !lastPanLatLng ? true : map.distance(lastPanLatLng, ll) >= minDistM;

    const reduceMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (okTime && okDist) {
      lastPanAt = now;
      lastPanLatLng = ll;
      map.panTo(ll, { animate: !reduceMotion, duration: 0.35 });
    }
  }

  function addPathPoint(lat, lon) {
    const la = clampLat(lat);
    const lo = normalizeLon(lon);

    path.addLatLng([la, lo]);

    // TR: Path çok büyümesin
    const pts = path.getLatLngs();
    if (pts.length > 800) path.setLatLngs(pts.slice(-800));
  }

  function clearPath() {
    path.setLatLngs([]);
  }

  return {
    setIssPosition,
    addPathPoint,
    clearPath,
    setFollowMode,
    getFollowMode,
    onFollowChange,
    // (debug için isteyen olursa) ensureMapSized
  };
}
