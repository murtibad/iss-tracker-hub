// src/constants/config.js
// TR: Uygulamanın tüm sabitleri burada. Magic number'lar burada tanımlanır.
// EN: All app constants live here. Magic numbers are defined centrally.

export const CONFIG = {
  // =====================
  // VERSION INFO
  // =====================
  VERSION: "v1.2.2",
  VERSION_DATE: "2025-12",
  VERSION_CODENAME: "Astraea",

  // =====================
  // PASS PREDICTION
  // =====================
  MIN_ELEVATION: 20, // Minimum elevation angle for visible pass (degrees)
  PASS_LOOKAHEAD_HOURS: 36, // How far ahead to calculate passes
  PASS_STEP_SECONDS: 10, // Step size for pass calculation

  // =====================
  // INTERVALS (milliseconds)
  // =====================
  INTERVAL_TELEMETRY_FETCH: 3000, // ISS position fetch interval
  INTERVAL_PREDICTION_REFRESH: 60000, // Pass prediction refresh
  INTERVAL_WEATHER_REFRESH_MS: 45000, // Weather data refresh
  INTERVAL_TRAJECTORY_REFRESH: 60000, // Trajectory line refresh
  INTERVAL_UI_TICK: 1000, // UI countdown tick

  // =====================
  // FOLLOW MODE
  // =====================
  FOLLOW_PAN_INTERVAL_MS: 4000, // Minimum interval between auto-pans
  FOLLOW_PAN_MIN_DISTANCE_M: 30000, // Minimum distance to trigger pan (meters)

  // =====================
  // MOTION SYSTEM (60fps interpolation)
  // =====================
  MOTION: {
    SMOOTH_FACTOR: 0.06, // Lerp speed (0.05-0.1 ideal)
    DATA_INTERVAL: 3000, // API fetch interval (ms)
    POSITION_THRESHOLD: 0.001 // Minimum movement threshold
  },

  // =====================
  // STORAGE KEYS
  // =====================
  STORAGE_KEYS: {
    THEME: "isshub:theme", // system | dark | light
    SKIN: "isshub:skin", // cyberpunk | liquid | realistic
    LANGUAGE: "isshub:language", // tr | en
    PLACE: "isshub:place_v2", // User location data
    VIEW_MODE: "isshub:viewMode", // 2d | 3d
    FOCUS_MODE: "isshub:focusMode" // iss | earth
  },

  // Legacy key (backward compatibility)
  THEME_STORAGE_KEY: "isshub:theme",

  // =====================
  // API ENDPOINTS
  // =====================
  API: {
    ISS_PRIMARY: "https://api.wheretheiss.at/v1/satellites/25544",
    ISS_SECONDARY: "https://api.open-notify.org/iss-now.json",
    CREW: "https://api.open-notify.org/astros.json",
    WEATHER: "https://api.open-meteo.com/v1/forecast",
    TLE_CELESTRAK: "https://celestrak.org/NORAD/elements/gp.php",
    TLE_N2YO: "https://tle.ivanstanojevic.me/api/tle/25544",
    NOMINATIM: "https://nominatim.openstreetmap.org"
  },

  // =====================
  // ISS CONSTANTS
  // =====================
  ISS: {
    NORAD_ID: 25544,
    NAME: "ZARYA (ISS)",
    DEFAULT_ALTITUDE_KM: 408,
    DEFAULT_VELOCITY_KMH: 27580,
    ORBITAL_PERIOD_MINUTES: 93,
    INCLINATION_DEGREES: 51.6
  },

  // =====================
  // 3D GLOBE SETTINGS
  // =====================
  GLOBE: {
    ORBIT_ALTITUDE: 0.15, // Relative altitude for ISS in Globe.gl units
    EARTH_RADIUS_KM: 6371,
    ATMOSPHERE_ALTITUDE: 0.2,
    DEFAULT_POV: { lat: 20, lng: 0, altitude: 2.5 },
    ISS_FOCUS_POV: { altitude: 0.25 }
  },

  // =====================
  // MAP SETTINGS
  // =====================
  MAP: {
    DEFAULT_CENTER: [35, 39], // [lng, lat] - Turkey
    DEFAULT_ZOOM: 4,
    MIN_ZOOM: 2,
    MAX_ZOOM: 18,
    TRAJECTORY_PAST_MINUTES: 45,
    TRAJECTORY_FUTURE_MINUTES: 90,
    TRAJECTORY_STEP_SECONDS: 30
  },

  // =====================
  // UI SETTINGS
  // =====================
  UI: {
    TOAST_DURATION_MS: 3000,
    MODAL_ANIMATION_MS: 300,
    LOADING_TIMEOUT_MS: 10000,
    DEBOUNCE_SEARCH_MS: 250
  },

  // =====================
  // THEME COLORS (defaults)
  // =====================
  COLORS: {
    ACCENT_DEFAULT: "#00d4ff", // Electric cyan
    ACCENT_REALISTIC: "#0099cc",
    ACCENT_CYBERPUNK: "#ff00ff",
    TRAJECTORY_PAST: "#00d4ff",
    TRAJECTORY_FUTURE: "#ffa500"
  }
};

// Freeze config to prevent accidental modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.MOTION);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.API);
Object.freeze(CONFIG.ISS);
Object.freeze(CONFIG.GLOBE);
Object.freeze(CONFIG.MAP);
Object.freeze(CONFIG.UI);
Object.freeze(CONFIG.COLORS);
