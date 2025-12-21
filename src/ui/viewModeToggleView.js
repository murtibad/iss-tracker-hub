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

  const btn = el("button", "btn btn-primary");
  btn.type = "button";
  wrap.appendChild(btn);

  let mode = initialMode === "3d" ? "3d" : "2d";

  function render() {
    btn.textContent = mode === "3d" ? "3D Globe" : "2D Map";
    btn.title = mode === "3d" ? "2D haritaya geç" : "3D dünyaya geç";
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
