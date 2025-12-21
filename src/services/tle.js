// src/services/tle.js
// TR: ISS TLE çek + localStorage cache (offline dayanıklı).
// EN: Fetch ISS TLE + localStorage cache (offline resilient).

const KEY = "iss_tle_cache_v1";
const TLE_URL = "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE";

// TR: 6 saat cache yeterli (Alpha).
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

function readCache() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(line1, line2) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ line1, line2, ts: Date.now() }));
  } catch {
    // ignore
  }
}

function parseTleText(text) {
  const lines = String(text)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // CelesTrak bazen 3 satır döner: NAME + line1 + line2
  // Biz son iki satırı alıyoruz.
  if (lines.length >= 2) {
    const line2 = lines[lines.length - 1];
    const line1 = lines[lines.length - 2];
    return { line1, line2 };
  }
  throw new Error("TLE parse failed");
}

export async function getIssTle({ force = false } = {}) {
  const cached = readCache();
  const now = Date.now();

  if (!force && cached?.line1 && cached?.line2 && cached?.ts && now - cached.ts < MAX_AGE_MS) {
    return { line1: cached.line1, line2: cached.line2, fromCache: true };
  }

  try {
    const res = await fetch(TLE_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("TLE fetch failed");
    const text = await res.text();
    const { line1, line2 } = parseTleText(text);
    writeCache(line1, line2);
    return { line1, line2, fromCache: false };
  } catch (err) {
    // TR: İnternet yoksa cache varsa onu kullan.
    if (cached?.line1 && cached?.line2) {
      return { line1: cached.line1, line2: cached.line2, fromCache: true, stale: true };
    }
    throw err;
  }
}
