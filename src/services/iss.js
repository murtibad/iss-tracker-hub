// src/services/iss.js
// Türkçe yorum: WhereTheISS.at telemetri çekme (ham veriyi bizim formata çevirir)

const ENDPOINT = "https://api.wheretheiss.at/v1/satellites/25544";

export async function fetchIssTelemetry() {
  const res = await fetch(ENDPOINT, { cache: "no-store" });
  if (!res.ok) throw new Error("ISS_API_FAIL");

  const j = await res.json();

  return {
    lat: Number(j.latitude),
    lon: Number(j.longitude),
    altKm: Number(j.altitude),
    velKmh: Number(j.velocity),
    visibilityNow: j.visibility === "eclipsed" ? "eclipsed" : "daylight",
    ts: Date.now(),
  };
}
