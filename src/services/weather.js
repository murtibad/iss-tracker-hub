// src/services/weather.js
// TR: Open-Meteo ile anlık hava (koordinata göre)
// EN: Current weather via Open-Meteo (by coordinates)

// Basit bir cache: aynı koordinat için çok sık istek atmayalım
const CACHE_MS = 60_000;
let lastKey = null;
let lastAt = 0;
let lastValue = null;

export async function fetchCurrentWeather({ lat, lon } = {}) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error("WEATHER_BAD_COORDS");

  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const now = Date.now();
  if (key === lastKey && lastValue && now - lastAt < CACHE_MS) return lastValue;

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,wind_speed_10m,weather_code");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("WEATHER_API_FAIL");
  const j = await res.json();

  const cur = j?.current;
  const out = {
    tempC: Number(cur?.temperature_2m),
    windKmh: Number(cur?.wind_speed_10m),
    code: Number(cur?.weather_code),
    timeIso: typeof cur?.time === "string" ? cur.time : null,
  };

  lastKey = key;
  lastAt = now;
  lastValue = out;
  return out;
}

import { t } from '../i18n/i18n.js';

// TR: Open-Meteo weather_code → i18n label
export function weatherCodeLabel(code) {
  const c = Number(code);
  if (!Number.isFinite(c)) return "—";

  // Use translation key if exists, else fallback
  const key = `weather.code_${c}`;
  const label = t(key);

  // If no translation found, return default code string
  return (label && label !== key) ? label : `Code ${c}`;
}
