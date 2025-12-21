// src/ui/passCardView.js
// TR: Sıradaki geçiş kartı + Detaylar (expand/collapse)
// EN: Next pass card + Details toggle

import { COPY } from "../constants/copy.js";
import { CONFIG } from "../constants/config.js";

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

  const headRow = el("div", "pass-head");
  const title = el("div", "pass-title");
  title.textContent = COPY.passCard.title;

  const btnDetails = el("button", "btn btn-ghost btn-mini pass-details-btn");
  btnDetails.type = "button";
  btnDetails.textContent = COPY.ui.details || "Detaylar";

  headRow.append(title, btnDetails);

  const countdown = el("div", "pass-countdown");
  countdown.textContent = "--:--:--";

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

  extra.append(extraLine1, extraLine2);

  wrap.append(headRow, countdown, labelRow, meta, extra);

  let isOpen = false;
  function setOpen(v) {
    isOpen = Boolean(v);
    extra.style.display = isOpen ? "block" : "none";
    wrap.classList.toggle("open", isOpen);
    btnDetails.textContent = isOpen ? "Kapat" : (COPY.ui.details || "Detaylar");
  }

  btnDetails.addEventListener("click", (e) => {
    e.preventDefault();
    setOpen(!isOpen);
  });

  // Kartın gövdesine tıklayınca da aç/kapa (buton hariç)
  wrap.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.closest && t.closest(".pass-details-btn")) return;
    // sadece kartın içinde bir yere tıklandıysa
    setOpen(!isOpen);
  });

  function setLabel({ visible, reason, maxElev }) {
    // visible: boolean
    // reason: "lowAngle" | "invisible" | null
    // maxElev: number

    if (visible) {
      dot.style.background = "#16a34a"; // yeşil
      labelText.textContent = COPY.passCard.label.visible;
      return;
    }

    dot.style.background = "#ef4444"; // kırmızı

    if (reason === "lowAngle" && typeof maxElev === "number") {
      // COPY.passCard.label.poorAngle içinde {deg} var
      const txt = (COPY.passCard.label.poorAngle || "🔴 ZOR (Düşük Açı: {deg}°)")
        .replace("{deg}", String(Math.round(maxElev)));
      labelText.textContent = txt;
      return;
    }

    // default: görünmez
    labelText.textContent = "🔴 GÖRÜNMEZ";
  }

  function setState({ nextPass, nextVisiblePass, countdownText }) {
    countdown.textContent = countdownText || "--:--:--";

    if (!nextPass) {
      setLabel({ visible: false, reason: "invisible", maxElev: null });
      meta.textContent = "Yakında geçiş yok";
      extraLine1.textContent = "—";
      extraLine2.textContent = "—";
      return;
    }

    const aos = fmtTime(nextPass.aosMs);
    const los = fmtTime(nextPass.losMs);
    const max = typeof nextPass.maxElevDeg === "number" ? Math.round(nextPass.maxElevDeg) : null;

    const tpl = COPY.passCard.template || "AOS {aos} • LOS {los} • MAX {max}°";
    meta.textContent = tpl
      .replace("{aos}", aos)
      .replace("{los}", los)
      .replace("{max}", max == null ? "—" : String(max));

    const visible = !!nextPass.isVisible;
    const reason = nextPass.isLowAngle ? "lowAngle" : (visible ? null : "invisible");

    setLabel({
      visible,
      reason,
      maxElev: nextPass.maxElevDeg,
    });

    // Detaylar
    // 1) AOS/LOS ve süre
    const durSec = typeof nextPass.durationSec === "number" ? nextPass.durationSec : null;
    const durMin = durSec == null ? "—" : `${Math.max(1, Math.round(durSec / 60))} dk`;
    extraLine1.textContent = `AOS: ${aos} • LOS: ${los} • Süre: ${durMin}`;

    // 2) İlk görünür geçiş
    if (nextVisiblePass && typeof nextVisiblePass.aosMs === "number") {
      const diffSec = Math.max(0, Math.floor((nextVisiblePass.aosMs - Date.now()) / 1000));
      // TR: “X sa Y dk sonra (HH:MM)” formatı
      const h = Math.floor(diffSec / 3600);
      const m = Math.floor((diffSec % 3600) / 60);

      const timeTxt = fmtTime(nextVisiblePass.aosMs);
      extraLine2.textContent = `İlk görünür geçiş: ${h}sa ${m}dk sonra (${timeTxt})`;
    } else {
      extraLine2.textContent = "İlk görünür geçiş: bulunamadı";
    }

    // TR: Açık kalması isterse kalsın; burada otomatik kapatmıyoruz
  }

  return {
    el: wrap,
    setState,
    setOpen,
  };
}
