// src/services/iss.js
// 3-Tier Fallback ISS Data Fetcher
// Primary: wheretheiss.at | Secondary: open-notify.org | Tertiary: TLE-based calculation

import { getIssTle } from './tle.js';
import * as satellite from 'satellite.js';

const PRIMARY_API = "https://api.wheretheiss.at/v1/satellites/25544";
const SECONDARY_API = "http://api.open-notify.org/iss-now.json";

/**
 * Normalize ISS data to consistent format
 */
function normalizeData(data, source) {
  return {
    lat: Number(data.lat),
    lon: Number(data.lon),
    altKm: Number(data.altKm || 408), // Default ISS altitude
    velKmh: Number(data.velKmh || 27580), // Default ISS velocity
    source,
    ts: Date.now()
  };
}

/**
 * Primary: WhereTheISS.at API
 */
async function fetchPrimary() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(PRIMARY_API, {
      cache: "no-store",
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();

    return normalizeData({
      lat: j.latitude,
      lon: j.longitude,
      altKm: j.altitude,
      velKmh: j.velocity
    }, 'wheretheiss');
  } catch (e) {
    clearTimeout(timeout);
    throw new Error(`Primary failed: ${e.message}`);
  }
}

/**
 * Secondary: Open-Notify API
 */
async function fetchSecondary() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(SECONDARY_API, {
      cache: "no-store",
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();

    if (j.message !== 'success') throw new Error('API returned failure');

    return normalizeData({
      lat: j.iss_position.latitude,
      lon: j.iss_position.longitude
    }, 'open-notify');
  } catch (e) {
    clearTimeout(timeout);
    throw new Error(`Secondary failed: ${e.message}`);
  }
}

/**
 * Tertiary: TLE-based SGP4 calculation (offline fallback)
 */
async function fetchTertiary() {
  try {
    const { line1, line2 } = await getIssTle();
    const satrec = satellite.twoline2satrec(line1, line2);
    const now = new Date();

    const positionAndVelocity = satellite.propagate(satrec, now);
    if (!positionAndVelocity.position) throw new Error('SGP4 propagation failed');

    const gmst = satellite.gstime(now);
    const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

    const lat = satellite.degreesLat(positionGd.latitude);
    const lon = satellite.degreesLong(positionGd.longitude);
    const alt = positionGd.height;

    return normalizeData({
      lat,
      lon,
      altKm: alt
    }, 'tle-sgp4');
  } catch (e) {
    throw new Error(`Tertiary failed: ${e.message}`);
  }
}

/**
 * Main ISS fetch with 3-tier fallback chain
 * @returns {Promise<Object|null>} ISS coordinates or null if all fail
 */
export async function fetchIssTelemetry() {
  // Try Primary (wheretheiss.at)
  try {
    const data = await fetchPrimary();
    console.log('[ISS] ✅ Primary API success');
    return data;
  } catch (e1) {
    console.warn('[ISS] ⚠️ Primary failed:', e1.message);

    // Try Secondary (open-notify)
    try {
      const data = await fetchSecondary();
      console.log('[ISS] ✅ Secondary API success');
      return data;
    } catch (e2) {
      console.warn('[ISS] ⚠️ Secondary failed:', e2.message);

      // Try Tertiary (TLE calculation)
      try {
        const data = await fetchTertiary();
        console.log('[ISS] ✅ Tertiary (TLE) success');
        return data;
      } catch (e3) {
        console.error('[ISS] ❌ CRITICAL: All data streams failed. Switching to SIMULATION.');
        return normalizeData(getSimulatedPosition(), 'simulation');
      }
    }
  }
}

/**
 * Quaternary: Simulation Mode (Last resort)
 * Moves ISS along a simplified orbit so UI is never empty
 */
function getSimulatedPosition() {
  const now = Date.now();
  // Rough approximation of ISS orbit
  // Period ~93 mins, Inc ~51.6deg
  const timeScale = now / 1000 / 5560 * (Math.PI * 2);
  const lat = Math.sin(timeScale) * 51.6;
  const lon = (now / 1000 / 10) % 360 - 180; // Moves west to east

  return {
    lat,
    lon,
    altKm: 420 + Math.sin(now / 10000) * 10,
    velKmh: 27580 + Math.cos(now / 10000) * 50,
    source: 'simulation'
  };
}

// Legacy export for backward compatibility
export { fetchIssTelemetry as getISSCoordinates };
