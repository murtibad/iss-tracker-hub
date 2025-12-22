// src/constants/config.js
// TR: Uygulamanın tüm sabitleri burada.
// EN: All app constants live here.

export const CONFIG = {
  VERSION: "v0.2-beta",

  // Location / pass
  MIN_ELEVATION: 20,

  // Telemetry (ms)
  INTERVAL_TELEMETRY_FETCH: 2000,

  // Prediction (ms)
  INTERVAL_PREDICTION_REFRESH: 60000,

  // ISS altı hava (ms)
  INTERVAL_WEATHER_REFRESH_MS: 45000,

  // Terminal log (ms) - telemetri spam azaltma
  TERMINAL_TELEMETRY_LOG_INTERVAL_MS: 10000,

  // Follow mode optimize
  FOLLOW_PAN_INTERVAL_MS: 4000,      // en sık 4 sn’de bir pan
  FOLLOW_PAN_MIN_DISTANCE_M: 30000,  // en az 30 km değişince pan

  // Theme key (NEW)
  THEME_STORAGE_KEY: "isshub:theme", // system | dark | light
};
