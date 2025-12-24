// src/ui/weatherBadgeView.js
// TR: ISS altındaki ülke için küçük “anlık hava” rozeti
// EN: Small current weather badge for the country under ISS

import { t } from '../i18n/i18n.js';

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

export function createWeatherBadge() {
  const wrap = el("div", "weather-badge glass");
  wrap.style.position = "fixed";
  wrap.style.left = "16px";
  wrap.style.bottom = "16px";
  wrap.style.zIndex = "25";
  wrap.style.padding = "16px";
  wrap.style.minWidth = "280px"; // Increased width for larger text
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.gap = "4px";

  const title = el("div", "weather-title");
  title.textContent = t('weather')?.visLabel || "Hava durumu";
  title.style.fontSize = "18px";
  title.style.fontWeight = "900";
  title.style.color = "var(--accent)";
  title.style.marginBottom = "4px";

  const line1 = el("div", "weather-line");
  line1.textContent = "—";
  line1.style.fontSize = "18px"; // Strict 18px
  line1.style.fontWeight = "700";
  line1.style.color = "var(--text)";

  const line2 = el("div", "weather-line muted");
  line2.textContent = "—";
  line2.style.fontSize = "18px"; // Strict 18px
  line2.style.color = "var(--muted)";

  // New Visibility Hint Line
  const visLine = el("div", "weather-vis-hint");
  visLine.style.fontSize = "18px"; // Strict 18px
  visLine.style.fontWeight = "800";
  visLine.style.marginTop = "8px";
  visLine.style.paddingTop = "8px";
  visLine.style.borderTop = "1px solid var(--ring)";
  visLine.style.display = "none"; // Hidden by default

  wrap.append(title, line1, line2, visLine);

  function setState({ placeLabel, tempC, windKmh, codeLabel, timeLabel, code } = {}) {
    const where = placeLabel ? `• ${placeLabel}` : "";
    const tVal = Number.isFinite(tempC) ? `${Math.round(tempC)}°C` : "—";
    const w = Number.isFinite(windKmh) ? `${Math.round(windKmh)} km/h` : "—";

    line1.textContent = `${tVal} ${codeLabel ? `(${codeLabel})` : ""} ${where}`.trim();
    line2.textContent = `Rüzgar: ${w}${timeLabel ? ` • ${timeLabel}` : ""}`;

    // Visibility Hint Logic
    if (Number.isFinite(code)) {
      visLine.style.display = "block";
      const c = Number(code);
      // Codes 0, 1, 2 = Clear/Mainly Clear/Partly Cloudy = Good Visibility
      const isGood = c <= 2;

      if (isGood) {
        visLine.textContent = t('weather')?.visGood || "👀 Good View";
        visLine.style.color = "var(--good)"; // Green/Teal
      } else {
        visLine.textContent = t('weather')?.visPoor || "☁️ Poor View";
        visLine.style.color = "var(--warning)"; // Orange/Yellow
      }
    } else {
      visLine.style.display = "none";
    }
  }

  return {
    el: wrap,
    setState,
  };
}
