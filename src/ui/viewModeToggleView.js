// src/ui/viewModeToggleView.js
// TR: 2D / 3D görünüm toggle butonu + Odak Modu
// EN: 2D / 3D view toggle button + Focus Mode

import { t } from '../i18n/i18n.js';

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

const STORAGE_KEY = "isshub:view_mode"; // "2d" | "3d"
const FOCUS_STORAGE_KEY = "isshub:focus_mode"; // "earth" | "iss"

export function getInitialViewMode() {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "3d" ? "3d" : "2d";
}

export function getInitialFocusMode() {
  const v = localStorage.getItem(FOCUS_STORAGE_KEY);
  return v === "iss" ? "iss" : "earth";
}

export function createViewModeToggle({ initialMode = "2d", onChange, onFocusChange } = {}) {
  // TR: Vite HMR veya yeniden boot durumlarında üst üste binmemesi için
  //     önce var olan toggle'ı temizle.
  // EN: Remove any existing toggle to avoid duplicates (e.g. HMR/reboot).
  try {
    const prev = document.getElementById("isshub-viewmode-toggle");
    if (prev) prev.remove();
  } catch { }

  const wrap = el("div", "view-toggle glass");
  wrap.id = "isshub-viewmode-toggle";
  wrap.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  `;

  // 2D/3D Modu Butonu
  const btn = el("button", "btn btn-primary view-mode-btn");
  btn.type = "button";
  btn.style.cssText = `
    width: 44px;
    height: 44px;
    border-radius: 50%;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  `;
  wrap.appendChild(btn);

  // Odak Modu Butonu (sadece 3D modda görünür)
  const focusBtn = el("button", "btn btn-secondary focus-mode-btn");
  focusBtn.type = "button";
  focusBtn.style.cssText = `
    width: 40px;
    height: 40px;
    border-radius: 50%;
    padding: 0;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    background: rgba(0, 180, 255, 0.3);
    border: 2px solid rgba(0, 200, 255, 0.6);
    color: #00d4ff;
    transition: all 0.3s ease;
  `;
  wrap.appendChild(focusBtn);

  let mode = initialMode === "3d" ? "3d" : "2d";
  let focusMode = getInitialFocusMode();

  // Icons
  const iconMap = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>`;
  const iconGlobe = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
  const iconEarth = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="10" ry="4"/></svg>`;
  const iconISS = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="1" y="8" width="4" height="8"/><rect x="19" y="8" width="4" height="8"/><circle cx="12" cy="12" r="2"/></svg>`;

  function render() {
    const label = mode === "3d" ? "3D Küre" : "2D Harita";
    const nextLabel = mode === "3d" ? "Switch to 2D Map" : "Switch to 3D Globe";

    // Icon content
    btn.innerHTML = mode === "3d" ? iconMap : iconGlobe;
    btn.title = nextLabel;
    btn.setAttribute("aria-label", nextLabel);

    // Visible Label Container (Elderly UX)
    let labelContainer = document.getElementById('view-mode-label');
    if (!labelContainer) {
      labelContainer = document.createElement('div');
      labelContainer.id = 'view-mode-label';
      labelContainer.style.cssText = `
            background: var(--card);
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid var(--border);
            color: var(--text);
            font-size: 18px;
            font-weight: 700;
            text-align: left;
            pointer-events: none;
            position: absolute;
            left: 60px;
            top: 0;
            white-space: nowrap;
            box-shadow: var(--shadow);
            display: flex;
            align-items: center;
            height: 44px;
        `;
      wrap.appendChild(labelContainer);
    }
    labelContainer.textContent = mode === "3d" ? `${t('mode')}: ${t('mode3d')}` : `${t('mode')}: ${t('mode2d')}`;

    // Odak butonu sadece 3D modda görünür
    if (mode === "3d") {
      focusBtn.style.display = "flex";
      renderFocusBtn();
    } else {
      focusBtn.style.display = "none";
      // Clear secondary label if exists
      const focusLabel = document.getElementById('focus-mode-label');
      if (focusLabel) focusLabel.style.display = 'none';
    }
  }

  function renderFocusBtn() {
    // Focus Label (Elderly UX)
    let focusLabel = document.getElementById('focus-mode-label');
    if (!focusLabel) {
      focusLabel = document.createElement('div');
      focusLabel.id = 'focus-mode-label';
      focusLabel.style.cssText = `
            background: var(--card);
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid var(--border);
            color: var(--text);
            font-size: 18px;
            font-weight: 700;
            text-align: left;
            pointer-events: none;
            position: absolute;
            left: 60px;
            top: 52px;
            white-space: nowrap;
            box-shadow: var(--shadow);
            display: flex;
            align-items: center;
            height: 40px;
        `;
      wrap.appendChild(focusLabel);
    }
    focusLabel.style.display = 'flex';

    if (focusMode === "iss") {
      focusBtn.innerHTML = iconEarth;
      focusBtn.title = "Switch to Earth View";
      focusBtn.style.background = "rgba(255, 100, 50, 0.4)";
      focusBtn.style.borderColor = "rgba(255, 150, 100, 0.8)";
      focusBtn.style.color = "#ffaa66";
      focusLabel.textContent = `${t('focus')}: ${t('focusISS')}`;
    } else {
      focusBtn.innerHTML = iconISS;
      focusBtn.title = "Focus on ISS";
      focusBtn.style.background = "rgba(0, 180, 255, 0.3)";
      focusBtn.style.borderColor = "rgba(0, 200, 255, 0.6)";
      focusBtn.style.color = "#00d4ff";
      focusLabel.textContent = `${t('focus')}: ${t('focusEarth')}`;
    }
  }

  function setMode(v) {
    const next = v === "3d" ? "3d" : "2d";
    mode = next;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch { }
    render();
    if (typeof onChange === "function") onChange(mode);
  }

  function setFocusMode(v) {
    const next = v === "iss" ? "iss" : "earth";
    focusMode = next;
    try {
      localStorage.setItem(FOCUS_STORAGE_KEY, focusMode);
    } catch { }
    renderFocusBtn();
    if (typeof onFocusChange === "function") onFocusChange(focusMode);
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    setMode(mode === "3d" ? "2d" : "3d");
  });

  focusBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setFocusMode(focusMode === "iss" ? "earth" : "iss");
  });

  // Language change listener - update labels dynamically
  window.addEventListener('language-change', () => {
    render();
    if (mode === "3d") {
      renderFocusBtn();
    }
  });

  render();

  return {
    el: wrap,
    getMode: () => mode,
    setMode,
    getFocusMode: () => focusMode,
    setFocusMode,
  };
}
