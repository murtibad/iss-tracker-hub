// src/ui/controlPanelView.js
// Single compact panel w/ tabs: HUD / Crew / Settings / Terminal (hover + mobile sheet)

import { CREW } from "../services/crew.js";

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function fmtDateTR(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function yearsOld(birthDateIso) {
  if (!birthDateIso) return null;
  const b = new Date(birthDateIso);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let y = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) y--;
  return y;
}

function daysSince(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  if (diff < 0) return null;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isTouchDevice() {
  return window.matchMedia?.("(pointer: coarse)")?.matches || "ontouchstart" in window;
}

export function createControlPanel({ onThemeOpen, onOpenTerminal, onLog } = {}) {
  const wrap = el("div", "cp glass-strong");

  // Header
  const top = el("div", "cp-top");
  const title = el("div", "cp-title");
  title.textContent = "Kontrol Paneli";

  const tabs = el("div", "cp-tabs");
  const tabHUD = el("button", "cp-tab is-active");
  tabHUD.type = "button";
  tabHUD.textContent = "HUD";

  const tabCrew = el("button", "cp-tab");
  tabCrew.type = "button";
  tabCrew.textContent = "Mürettebat";

  const tabSettings = el("button", "cp-tab");
  tabSettings.type = "button";
  tabSettings.textContent = "Ayarlar";

  const tabTerminal = el("button", "cp-tab");
  tabTerminal.type = "button";
  tabTerminal.textContent = "Terminal";

  tabs.append(tabHUD, tabCrew, tabSettings, tabTerminal);
  top.append(title, tabs);

  // Body
  const body = el("div", "cp-body");

  // ---- HUD page (compact key-values) ----
  const pageHUD = el("div", "cp-page");
  const hudGrid = el("div", "cp-kv");

  const kv = (k) => {
    const row = el("div", "cp-kv-row");
    const kk = el("div", "cp-k"); kk.textContent = k;
    const vv = el("div", "cp-v"); vv.textContent = "—";
    row.append(kk, vv);
    return { row, vv };
  };

  const hudAlt = kv("İrtifa");
  const hudVel = kv("Hız");
  const hudPos = kv("Enlem / Boylam");
  const hudLight = kv("Işık");
  const hudCity = kv("Şehir");
  const hudFollow = kv("Takip");
  const hudTheme = kv("Tema");
  const hudAccent = kv("Renk");

  hudGrid.append(
    hudAlt.row,
    hudVel.row,
    hudPos.row,
    hudLight.row,
    hudCity.row,
    hudFollow.row,
    hudTheme.row,
    hudAccent.row
  );

  pageHUD.append(hudGrid);

  // ---- Crew page (compact list + hover card / mobile sheet) ----
  const pageCrew = el("div", "cp-page");
  pageCrew.style.display = "none";

  const crewTop = el("div", "crew-top");
  const crewCount = el("div", "crew-count");
  crewCount.textContent = `Toplam: ${CREW.length}`;

  const crewHint = el("div", "crew-hint");
  crewHint.textContent = isTouchDevice()
    ? "Detay için isme dokun."
    : "Detay için ismin üstüne gel.";

  crewTop.append(crewCount, crewHint);

  const crewList = el("div", "crew-list");
  pageCrew.append(crewTop, crewList);

  // Hover card (desktop)
  const hoverCard = el("div", "crew-pop glass-strong");
  hoverCard.style.display = "none";
  document.body.append(hoverCard);

  // Mobile sheet
  const sheet = el("div", "crew-sheet");
  sheet.style.display = "none";
  const sheetBg = el("div", "crew-sheet-bg");
  const sheetCard = el("div", "crew-sheet-card glass-strong");
  sheet.append(sheetBg, sheetCard);
  document.body.append(sheet);

  function renderPersonCard(p, container) {
    container.innerHTML = "";

    const header = el("div", "crew-pop-h");

    const avatar = el("div", "crew-ava");
    if (p.photo) {
      avatar.style.backgroundImage = `url("${p.photo}")`;
      avatar.classList.add("has-photo");
    } else {
      avatar.textContent = (p.name || "?").slice(0, 1).toUpperCase();
    }

    const meta = el("div", "crew-meta");
    const name = el("div", "crew-name");
    name.textContent = p.name || "—";
    const sub = el("div", "crew-sub");
    sub.textContent = [p.agency, p.role].filter(Boolean).join(" • ") || "—";
    meta.append(name, sub);

    header.append(avatar, meta);

    const info = el("div", "crew-info");

    const age = yearsOld(p.birthDate);
    const days = daysSince(p.launchDate);

    const line1 = el("div", "crew-line");
    line1.textContent = `Yaş: ${age ?? "—"}`;

    const line2 = el("div", "crew-line");
    line2.textContent = `Görev günü: ${days ?? "—"}`;

    const line3 = el("div", "crew-line");
    line3.textContent = `Doğum: ${fmtDateTR(p.birthDate)} • Fırlatma: ${fmtDateTR(p.launchDate)}`;

    const actions = el("div", "crew-actions");
    const btnWiki = el("a", "btn btn-mini");
    btnWiki.textContent = "Wiki";
    btnWiki.href = p.wiki || "#";
    btnWiki.target = "_blank";
    btnWiki.rel = "noreferrer";

    actions.append(btnWiki);

    info.append(line1, line2, line3, actions);

    container.append(header, info);
  }

  function showHover(p, x, y) {
    renderPersonCard(p, hoverCard);

    hoverCard.style.display = "block";
    const w = 320;
    const h = 180;

    const vx = Math.min(window.innerWidth - w - 12, Math.max(12, x + 14));
    const vy = Math.min(window.innerHeight - h - 12, Math.max(12, y + 14));

    hoverCard.style.left = `${vx}px`;
    hoverCard.style.top = `${vy}px`;
  }

  function hideHover() {
    hoverCard.style.display = "none";
  }

  function openSheet(p) {
    renderPersonCard(p, sheetCard);
    sheet.style.display = "block";
  }

  function closeSheet() {
    sheet.style.display = "none";
  }

  sheetBg.addEventListener("click", closeSheet);

  CREW.forEach((p) => {
    const item = el("button", "crew-item");
    item.type = "button";

    const dot = el("span", "crew-dot");
    const name = el("span", "crew-item-name");
    name.textContent = p.name;

    item.append(dot, name);

    if (isTouchDevice()) {
      item.addEventListener("click", () => {
        openSheet(p);
        onLog?.(`ui> mürettebat detay: ${p.name}`);
      });
    } else {
      item.addEventListener("mouseenter", (e) => {
        showHover(p, e.clientX, e.clientY);
      });
      item.addEventListener("mousemove", (e) => {
        if (hoverCard.style.display !== "none") showHover(p, e.clientX, e.clientY);
      });
      item.addEventListener("mouseleave", hideHover);
      item.addEventListener("click", () => {
        // Also allow click to open wiki quickly if wanted
        onLog?.(`ui> mürettebat hover: ${p.name}`);
      });
    }

    crewList.append(item);
  });

  // ---- Settings page (compact buttons; open existing menu if you want) ----
  const pageSettings = el("div", "cp-page");
  pageSettings.style.display = "none";

  const settingsGrid = el("div", "cp-actions");

  const btnTheme = el("button", "btn");
  btnTheme.type = "button";
  btnTheme.textContent = "Tema / Renk Ayarları";
  btnTheme.addEventListener("click", () => {
    onThemeOpen?.();
    onLog?.("ui> ayarlar: tema menüsü");
  });

  const btnTerm = el("button", "btn");
  btnTerm.type = "button";
  btnTerm.textContent = "Terminali Aç/Kapat";
  btnTerm.addEventListener("click", () => {
    onOpenTerminal?.();
    onLog?.("ui> ayarlar: terminal toggle");
  });

  settingsGrid.append(btnTheme, btnTerm);
  pageSettings.append(settingsGrid);

  // ---- Terminal page placeholder (we keep terminal external OR you pass a node) ----
  const pageTerminal = el("div", "cp-page");
  pageTerminal.style.display = "none";

  const termNote = el("div", "cp-note");
  termNote.textContent = "Terminal alt köşede. Buradan aç/kapatabilirsin.";
  pageTerminal.append(termNote);

  // Assemble
  body.append(pageHUD, pageCrew, pageSettings, pageTerminal);
  wrap.append(top, body);

  function setTab(active) {
    const tabsAll = [tabHUD, tabCrew, tabSettings, tabTerminal];
    tabsAll.forEach((t) => t.classList.remove("is-active"));

    pageHUD.style.display = "none";
    pageCrew.style.display = "none";
    pageSettings.style.display = "none";
    pageTerminal.style.display = "none";

    if (active === "hud") {
      tabHUD.classList.add("is-active");
      pageHUD.style.display = "block";
    } else if (active === "crew") {
      tabCrew.classList.add("is-active");
      pageCrew.style.display = "block";
    } else if (active === "settings") {
      tabSettings.classList.add("is-active");
      pageSettings.style.display = "block";
    } else if (active === "terminal") {
      tabTerminal.classList.add("is-active");
      pageTerminal.style.display = "block";
    }
  }

  tabHUD.addEventListener("click", () => setTab("hud"));
  tabCrew.addEventListener("click", () => setTab("crew"));
  tabSettings.addEventListener("click", () => setTab("settings"));
  tabTerminal.addEventListener("click", () => setTab("terminal"));

  // Public API to update HUD fields
  function setHUD({
    altKm,
    velKmh,
    lat,
    lon,
    lightText,
    cityName,
    followOn,
    themeText,
    accentText,
  }) {
    hudAlt.vv.textContent = altKm != null ? `${altKm} km` : "—";
    hudVel.vv.textContent = velKmh != null ? `${velKmh} km/h` : "—";
    hudPos.vv.textContent =
      lat != null && lon != null ? `${lat} / ${lon}` : "—";
    hudLight.vv.textContent = lightText ?? "—";
    hudCity.vv.textContent = cityName ?? "—";
    hudFollow.vv.textContent = followOn ? "Açık" : "Kapalı";
    hudTheme.vv.textContent = themeText ?? "—";
    hudAccent.vv.textContent = accentText ?? "—";
  }

  function destroy() {
    hoverCard.remove();
    sheet.remove();
  }

  return {
    el: wrap,
    setTab,
    setHUD,
    destroy,
  };
}
