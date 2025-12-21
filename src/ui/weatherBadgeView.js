// src/ui/weatherBadgeView.js
// TR: ISS altındaki ülke için küçük “anlık hava” rozeti
// EN: Small current weather badge for the country under ISS

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
  wrap.style.padding = "10px 12px";
  wrap.style.minWidth = "220px";

  const title = el("div", "weather-title");
  title.textContent = "Hava durumu";

  const line1 = el("div", "weather-line");
  line1.textContent = "—";

  const line2 = el("div", "weather-line muted");
  line2.textContent = "—";

  wrap.append(title, line1, line2);

  function setState({ placeLabel, tempC, windKmh, codeLabel, timeLabel } = {}) {
    const where = placeLabel ? `• ${placeLabel}` : "";
    const t = Number.isFinite(tempC) ? `${Math.round(tempC)}°C` : "—";
    const w = Number.isFinite(windKmh) ? `${Math.round(windKmh)} km/h` : "—";

    line1.textContent = `${t} ${codeLabel ? `(${codeLabel})` : ""} ${where}`.trim();
    line2.textContent = `Rüzgar: ${w}${timeLabel ? ` • ${timeLabel}` : ""}`;
  }

  return {
    el: wrap,
    setState,
  };
}
