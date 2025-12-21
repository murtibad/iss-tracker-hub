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

// TR: Open-Meteo weather_code → kısa insan okunur etiket
export function weatherCodeLabel(code) {
  const c = Number(code);
  if (!Number.isFinite(c)) return "—";

  // Kaynak: Open-Meteo WMO weather interpretation codes (özet eşleme)
  if (c === 0) return "Açık";
  if (c === 1) return "Çoğunlukla açık";
  if (c === 2) return "Parçalı bulutlu";
  if (c === 3) return "Kapalı";

  if (c === 45 || c === 48) return "Sis";

  if (c >= 51 && c <= 57) return "Çise";
  if (c >= 61 && c <= 67) return "Yağmur";
  if (c >= 71 && c <= 77) return "Kar";
  if (c >= 80 && c <= 82) return "Sağanak";
  if (c >= 85 && c <= 86) return "Kar sağanağı";
  if (c >= 95 && c <= 99) return "Fırtına";

  return `Kod ${c}`;
}
