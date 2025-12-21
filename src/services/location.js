// src/services/location.js
// Türkçe yorum: Tarayıcıdan konum isteme. Başarısız olursa manuel şehir seçimine düşeriz.

export function requestBrowserLocation({ timeoutMs = 9000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("GEOLOCATION_UNAVAILABLE"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null,
        });
      },
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 0 }
    );
  });
}
