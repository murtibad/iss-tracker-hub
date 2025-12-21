// src/services/theme.js
// TR: Tema (system/dark/light) + Skin (normal/cyber) + Accent (renk) yönetimi
// EN: Theme (system/dark/light) + skin (normal/cyber) + accent management

import { CONFIG } from "../constants/config.js";

// TR: Yeni ana key CONFIG.THEME_STORAGE_KEY
// TR: Eski key ile geriye dönük uyumluluk (legacy)
const KEY_THEME_PRIMARY = CONFIG?.THEME_STORAGE_KEY || "isshub:theme";
const KEY_THEME_LEGACY = "iss_theme_mode"; // eski sürümlerde vardı

const KEY_SKIN = "iss_skin";          // normal | cyber
const KEY_ACCENT = "iss_accent";      // magenta | cyan | lime | yellow | red | purple | orange | white

const DEFAULT_THEME = "system";
const DEFAULT_SKIN = "normal";
const DEFAULT_ACCENT = "magenta";

function safeGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v || fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch {
    // sessiz
  }
}

function systemTheme() {
  if (!window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function dispatchThemeChange() {
  try {
    window.dispatchEvent(new CustomEvent("iss:themechange"));
  } catch {
    // sessiz
  }
}

export function getSavedThemeMode() {
  // TR: Önce yeni key’e bak, yoksa legacy’ye bak.
  const v1 = safeGet(KEY_THEME_PRIMARY, "");
  if (v1 === "system" || v1 === "dark" || v1 === "light") return v1;

  const v2 = safeGet(KEY_THEME_LEGACY, DEFAULT_THEME);
  if (v2 === "system" || v2 === "dark" || v2 === "light") return v2;

  return DEFAULT_THEME;
}

export function getSavedSkin() {
  const v = safeGet(KEY_SKIN, DEFAULT_SKIN);
  return v === "cyber" ? "cyber" : "normal";
}

export function getSavedAccent() {
  const v = safeGet(KEY_ACCENT, DEFAULT_ACCENT);
  return v || DEFAULT_ACCENT;
}

export function saveThemeMode(mode) {
  const v = mode === "dark" || mode === "light" || mode === "system" ? mode : DEFAULT_THEME;

  // TR: Hem yeni hem legacy’ye yaz (eski sürümden gelenler bozulmasın)
  safeSet(KEY_THEME_PRIMARY, v);
  safeSet(KEY_THEME_LEGACY, v);

  applyThemeState();
}

export function saveSkin(skin) {
  const v = skin === "cyber" ? "cyber" : "normal";
  safeSet(KEY_SKIN, v);
  applyThemeState();
}

export function saveAccent(accent) {
  safeSet(KEY_ACCENT, accent || DEFAULT_ACCENT);
  applyThemeState();
}

export function applyThemeState() {
  const html = document.documentElement;

  const mode = getSavedThemeMode();
  const theme = mode === "system" ? systemTheme() : mode;

  const skin = getSavedSkin();
  const accent = getSavedAccent();

  // CSS'in beklediği dataset isimleri
  html.dataset.theme = theme;      // light/dark (final)
  html.dataset.mode = mode;        // system/dark/light (user choice)
  html.dataset.skin = skin;        // normal/cyber
  html.dataset.accent = accent;    // palette

  dispatchThemeChange();
}

export function initTheme() {
  // İlk açılışta uygula
  applyThemeState();

  // System modunda sistem değişirse otomatik güncelle
  if (window.matchMedia) {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const mode = getSavedThemeMode();
      if (mode === "system") applyThemeState();
    };

    if (mql.addEventListener) mql.addEventListener("change", handler);
    else if (mql.addListener) mql.addListener(handler);
  }
}
