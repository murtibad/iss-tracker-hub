// src/ui/viewModeToggleView.js
// TR: 2D / 3D görünüm toggle butonu
// EN: 2D / 3D view toggle button

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

const STORAGE_KEY = "isshub:view_mode"; // "2d" | "3d"

export function getInitialViewMode() {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "3d" ? "3d" : "2d";
}

export function createViewModeToggle({ initialMode = "2d", onChange } = {}) {
  // TR: Vite HMR veya yeniden boot durumlarında üst üste binmemesi için
  //     önce var olan toggle'ı temizle.
  // EN: Remove any existing toggle to avoid duplicates (e.g. HMR/reboot).
  try {
    const prev = document.getElementById("isshub-viewmode-toggle");
    if (prev) prev.remove();
  } catch { }

  const wrap = el("div", "view-toggle glass");
  wrap.id = "isshub-viewmode-toggle";
  wrap.style.position = "fixed";
  wrap.style.right = "16px";
  // TR: Sağ alttaki version label ile çakışmasın.
  // EN: Avoid overlapping the bottom-right version label.
  wrap.style.bottom = "56px";
  wrap.style.zIndex = "1300";

  const btn = el("button", "btn btn-primary view-mode-btn");
  btn.type = "button";
  // Add some specific styling for this button
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

  let mode = initialMode === "3d" ? "3d" : "2d";

  function render() {
    // Icons should be imported or passed. 
    // Since this file doesn't import ICONS, let's use emoji or simple svg for now
    // Or better, update imports.
    const iconMap = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>`;
    const iconGlobe = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;

    const label = mode === "3d" ? "Switch to 2D Map" : "Switch to 3D Globe";
    // If mode is 3D, button should show 2D icon to switch back? Or show current mode?
    // Usually toggle shows "What will happen". So if 3D, show Map icon.
    btn.innerHTML = mode === "3d" ? iconMap : iconGlobe;
    btn.title = mode === "3d" ? "2D Map" : "3D Globe";
    btn.setAttribute("aria-label", label);
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

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    setMode(mode === "3d" ? "2d" : "3d");
  });

  render();

  return {
    el: wrap,
    getMode: () => mode,
    setMode,
  };
}
