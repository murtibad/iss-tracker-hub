// src/services/prediction.js
// TR: SGP4 ile bir sonraki geçişi bulur (AOS/LOS/MAX). Timestamp döndürür (ms).
//     Ayrıca ilk "GÖRÜNÜR" geçişi de hesaplar (maxElev >= MIN_ELEVATION).
// EN: Finds next pass and next visible pass. Returns timestamps (ms).

import * as satellite from "satellite.js";
import { CONFIG } from "../constants/config.js";
import { getIssTle } from "./tle.js";

function deg(rad) {
  return (rad * 180) / Math.PI;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function formatHHMM(ms) {
  const d = new Date(ms);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function formatCountdown(totalSec) {
  const s = Math.max(0, Math.floor(totalSec));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

function getLookAngles(satrec, obsLatDeg, obsLonDeg, obsAltKm, dateObj) {
  const pv = satellite.propagate(satrec, dateObj);
  if (!pv.position) return null;

  const gmst = satellite.gstime(dateObj);
  const ecf = satellite.eciToEcf(pv.position, gmst);

  const observerGd = {
    latitude: satellite.degreesToRadians(obsLatDeg),
    longitude: satellite.degreesToRadians(obsLonDeg),
    height: obsAltKm,
  };

  const look = satellite.ecfToLookAngles(observerGd, ecf);
  return {
    elevation: deg(look.elevation),
    azimuth: deg(look.azimuth)
  };
}

// TR: Tek bir pass yakalar (ufuk üstü giriş/çıkış + maxElev).
function findPasses({ satrec, obsLat, obsLon, startMs, endMs, stepMs }) {
  const obsAltKm = 0.0;

  let inPass = false;
  let aosMs = null;
  let aosAz = null;
  let losMs = null;
  let losAz = null;
  let maxElev = -999;
  let maxMs = null;

  const passes = [];

  for (let t = startMs; t <= endMs; t += stepMs) {
    const look = getLookAngles(satrec, obsLat, obsLon, obsAltKm, new Date(t));
    if (!look) continue;

    const elev = look.elevation;
    const az = look.azimuth;

    const above = elev > 0;

    if (!inPass && above) {
      inPass = true;
      aosMs = t;
      aosAz = az;
      maxElev = elev;
      maxMs = t;
    }

    if (inPass) {
      if (elev > maxElev) {
        maxElev = elev;
        maxMs = t;
      }

      if (!above) {
        losMs = t;
        losAz = az;

        const pass = {
          aosMs,
          losMs,
          aosAz,
          losAz,
          maxMs: maxMs || aosMs,
          maxElev: Math.max(0, maxElev),
          visible: maxElev >= CONFIG.MIN_ELEVATION,
        };

        passes.push(pass);

        // reset for next
        inPass = false;
        aosMs = null;
        aosAz = null;
        losMs = null;
        losAz = null;
        maxElev = -999;
        maxMs = null;
      }
    }
  }

  // Close open pass at end loop
  if (inPass) {
    passes.push({
      aosMs,
      losMs: endMs,
      aosAz,
      losAz: 0, // Unknown
      maxMs: maxMs || aosMs,
      maxElev: Math.max(0, maxElev),
      visible: maxElev >= CONFIG.MIN_ELEVATION,
    });
  }

  return passes;
}

// TR: D-2 çıktısı: { nextPass, nextVisiblePass }
export async function computePassBundle({ obsLat, obsLon }) {
  const { line1, line2 } = await getIssTle();
  const satrec = satellite.twoline2satrec(line1, line2);

  const startMs = Date.now();
  const endMs = startMs + 36 * 60 * 60 * 1000; // 36 saat
  const stepMs = 10 * 1000; // 10sn

  const passes = findPasses({ satrec, obsLat, obsLon, startMs, endMs, stepMs });

  const nextPass = passes.length ? passes[0] : null;
  const nextVisiblePass = passes.find((p) => p.visible) || null;

  return { nextPass, nextVisiblePass };
}
