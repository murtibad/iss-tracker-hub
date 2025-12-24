// src/ui/passCardView.js
// TR: Sıradaki geçiş kartı + Detaylar (expand/collapse)
// EN: Next pass card + Details toggle

import { t, getCurrentLanguage } from "../i18n/i18n.js";
import { CONFIG } from "../constants/config.js";
import { downloadICS, togglePassNotifications, areNotificationsEnabled } from "../services/passNotification.js";
import { showToast } from "./components/toastManager.js";

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}



function pad2(x) {
  const s = String(x);
  return s.length === 1 ? "0" + s : s;
}

function fmtTime(ms) {
  if (!ms || typeof ms !== "number") return "—";
  const d = new Date(ms);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function createPassCard() {
  const wrap = el("div", "pass-card glass");

  // Phase 6 Typography Overrides
  const style = document.createElement('style');
  style.textContent = `
    .pass-title { font-size: 20px !important; font-weight: 800; letter-spacing: 0.5px; }
    .btn-mini { font-size: 18px !important; padding: 8px 16px; }
    .pass-countdown { 
        font-size: 32px !important; 
        font-family: 'Courier New', monospace; 
        font-weight: 900; 
        letter-spacing: 2px;
        color: var(--accent);
        text-shadow: 0 0 10px rgba(0,243,255,0.4);
    }
    .pass-label { font-size: 18px !important; font-weight: 600; opacity: 0.9; }
    .pass-meta { font-size: 18px !important; color: var(--muted); margin-top: 8px; }
    .pass-extra-line { font-size: 18px !important; color: #ddd; margin-bottom: 6px; }
    .btn-calendar { font-size: 18px !important; min-height: 44px; }
    .btn-notify { font-size: 18px !important; min-height: 44px; }
    .notify-warning { font-size: 18px !important; font-weight: 600; }
  `;
  wrap.appendChild(style);

  const headRow = el("div", "pass-head");
  const title = el("div", "pass-title");
  title.textContent = t('passCardTitle');

  const btnDetails = el("button", "btn btn-ghost btn-mini pass-details-btn");
  btnDetails.type = "button";
  btnDetails.textContent = t('passDetails');

  headRow.append(title, btnDetails);

  const countdown = el("div", "pass-countdown");
  countdown.textContent = "--:--:--";
  // Ensure strict min-height to prevent layout shift
  countdown.style.minHeight = "40px";

  const labelRow = el("div", "pass-label-row");
  const dot = el("span", "pass-dot");
  const labelText = el("span", "pass-label");
  labelText.textContent = "—";
  labelRow.append(dot, labelText);

  const meta = el("div", "pass-meta");
  meta.textContent = "—";

  const extra = el("div", "pass-extra");
  extra.style.display = "none";

  const extraLine1 = el("div", "pass-extra-line");
  const extraLine2 = el("div", "pass-extra-line");

  // Calendar export button
  const calendarBtn = el("button", "btn btn-calendar");
  calendarBtn.type = "button";
  const lang = getCurrentLanguage();
  calendarBtn.innerHTML = `📅 ${lang === 'tr' ? 'Takvime Ekle' : 'Add to Calendar'}`;
  calendarBtn.style.cssText = `
    margin-top: 8px;
    padding: 8px 12px;
    font-size: 11px;
    background: rgba(0,243,255,0.2);
    border: 1px solid var(--accent);
    border-radius: 6px;
    color: var(--accent);
    cursor: pointer;
    width: 100%;
    transition: 0.2s;
  `;
  calendarBtn.onmouseenter = () => calendarBtn.style.background = 'rgba(0,243,255,0.4)';
  calendarBtn.onmouseleave = () => calendarBtn.style.background = 'rgba(0,243,255,0.2)';

  // Notification Bell Button
  const notifyBtn = el("button", "btn btn-notify");
  notifyBtn.type = "button";
  notifyBtn.style.cssText = `
    margin-top: 8px;
    padding: 8px 12px;
    font-size: 11px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--muted);
    cursor: pointer;
    width: 100%;
    transition: 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  `;

  // Page Open Warning (Initially hidden)
  const keepOpenMsg = el("div", "notify-warning");
  keepOpenMsg.textContent = t('notify.keepOpen');
  keepOpenMsg.style.cssText = `
    font-size: 10px; color: var(--warning); margin-top: 6px; text-align: center; display: none;
  `;

  extra.append(extraLine1, extraLine2, calendarBtn, notifyBtn, keepOpenMsg);

  // Update button visual state
  const updateNotifyBtn = () => {
    const enabled = areNotificationsEnabled();
    const lang = getCurrentLanguage();

    if (enabled) {
      notifyBtn.innerHTML = t('notify.btnAlertOn');
      notifyBtn.style.background = 'rgba(255, 215, 0, 0.1)';
      notifyBtn.style.borderColor = 'var(--accent)';
      notifyBtn.style.color = 'var(--accent)';
      keepOpenMsg.style.display = 'block';
    } else {
      notifyBtn.innerHTML = t('notify.btnAlertOff');
      notifyBtn.style.background = 'rgba(255,255,255,0.05)';
      notifyBtn.style.borderColor = 'var(--border)';
      notifyBtn.style.color = 'var(--muted)';
      keepOpenMsg.style.display = 'none';
    }
  };

  // Initial State
  updateNotifyBtn();

  notifyBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const wasEnabled = areNotificationsEnabled();

    if (wasEnabled) {
      // Disable immediately
      await togglePassNotifications(false);
      updateNotifyBtn();
    } else {
      // Request Permission
      if (Notification.permission === 'denied') {
        showToast(t('notify.permDenied'), 'error');
        return;
      }

      const res = await togglePassNotifications(true);
      if (res.success) {
        updateNotifyBtn();
        showToast(t('notify.btnAlertOn'), 'success');
      } else if (res.error === 'permission_denied') {
        showToast(t('notify.permDenied'), 'error');
      }
    }
  });

  wrap.append(headRow, countdown, labelRow, meta, extra);

  // Store current pass data for calendar export
  let currentPassData = null;

  let isOpen = false;
  function setOpen(v) {
    isOpen = Boolean(v);
    extra.style.display = isOpen ? "block" : "none";
    wrap.classList.toggle("open", isOpen);
    btnDetails.textContent = isOpen ? t('passClose') : t('passDetails');
  }

  btnDetails.addEventListener("click", (e) => {
    e.preventDefault();
    setOpen(!isOpen);
  });

  // Calendar button click handler
  calendarBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentPassData) {
      const success = downloadICS({
        startTime: currentPassData.aosMs,
        duration: Math.round((currentPassData.durationSec || 300) / 60),
        maxElevation: currentPassData.maxElevDeg
      });
      if (success) {
        calendarBtn.innerHTML = '✅ ' + (getCurrentLanguage() === 'tr' ? 'İndirildi!' : 'Downloaded!');
        setTimeout(() => {
          calendarBtn.innerHTML = '📅 ' + (getCurrentLanguage() === 'tr' ? 'Takvime Ekle' : 'Add to Calendar');
        }, 2000);
      }
    }
  });

  // Kartın gövdesine tıklayınca da aç/kapa (buton hariç)
  wrap.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.closest && (target.closest(".pass-details-btn") || target.closest(".btn-calendar"))) return;
    // sadece kartın içinde bir yere tıklandıysa
    setOpen(!isOpen);
  });

  function setLabel({ visible, reason, maxElev }) {
    // visible: boolean
    // reason: "lowAngle" | "invisible" | null
    // maxElev: number

    if (visible) {
      dot.style.background = "#16a34a"; // yeşil
      labelText.textContent = t('passVisible');
      return;
    }

    dot.style.background = "#ef4444"; // kırmızı

    if (reason === "lowAngle" && typeof maxElev === "number") {
      const txt = t('passPoorAngle').replace('{deg}', String(Math.round(maxElev)));
      labelText.textContent = txt;
      return;
    }

    // default: görünmez
    labelText.textContent = t('passInvisible');
  }

  function setState({ nextPass, nextVisiblePass, countdownText }) {
    countdown.textContent = countdownText || "--:--:--";

    // Store for calendar export
    currentPassData = nextPass;

    if (!nextPass) {
      setLabel({ visible: false, reason: "invisible", maxElev: null });
      meta.textContent = t('passNone');
      extraLine1.textContent = "—";
      extraLine2.textContent = "—";
      calendarBtn.style.display = 'none';
      return;
    }

    calendarBtn.style.display = 'block';

    const aos = fmtTime(nextPass.aosMs);
    const los = fmtTime(nextPass.losMs);
    const max = typeof nextPass.maxElevDeg === "number" ? Math.round(nextPass.maxElevDeg) : null;

    // Template: "AOS {aos} • LOS {los} • MAX {max}°"
    meta.textContent = `AOS ${aos} • LOS ${los} • MAX ${max == null ? "—" : max}°`;

    const visible = !!nextPass.isVisible;
    const reason = nextPass.isLowAngle ? "lowAngle" : (visible ? null : "invisible");

    setLabel({
      visible,
      reason,
      maxElev: nextPass.maxElevDeg,
    });

    // Helper: Deg to Cardinal
    function getDir(deg) {
      if (deg == null) return "?";
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const idx = Math.round(deg / 45) % 8;
      return dirs[idx];
    }

    // Detaylar
    // 1) AOS/LOS ve süre ve YÖN
    const durSec = typeof nextPass.durationSec === "number" ? nextPass.durationSec : null;
    const durMinVal = durSec == null ? "—" : Math.max(1, Math.round(durSec / 60));
    const durMin = durSec == null ? "—" : t('passMinutes').replace('{min}', durMinVal);

    let dirHint = "";
    if (nextPass.aosAz != null && nextPass.losAz != null) {
      // Example: Look SW -> NE
      dirHint = ` • 👀 ${getDir(nextPass.aosAz)} ➡ ${getDir(nextPass.losAz)}`;
    }

    extraLine1.textContent = `AOS: ${aos} • LOS: ${los} • ${t('passDuration')}: ${durMin}${dirHint}`;

    // 2) İlk görünür geçiş
    if (nextVisiblePass && typeof nextVisiblePass.aosMs === "number") {
      const diffSec = Math.max(0, Math.floor((nextVisiblePass.aosMs - Date.now()) / 1000));
      const h = Math.floor(diffSec / 3600);
      const m = Math.floor((diffSec % 3600) / 60);

      const timeTxt = fmtTime(nextVisiblePass.aosMs);
      extraLine2.textContent = `${t('passFirstVisible')}: ${t('passHoursMinutes')
        .replace('{h}', h)
        .replace('{m}', m)
        .replace('{time}', timeTxt)}`;
    } else {
      extraLine2.textContent = `${t('passFirstVisible')}: ${t('passNotFoundDetails')}`;
    }

    // TR: Açık kalması isterse kalsın; burada otomatik kapatmıyoruz
  }

  return {
    el: wrap,
    setState,
    setOpen,
  };
}
