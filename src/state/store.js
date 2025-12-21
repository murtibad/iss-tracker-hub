// src/state/store.js
// Türkçe yorum: Tek store. UI sadece burayı okur. (Kontrol burada)

import { CONFIG } from "../constants/config.js";

export function createStore() {
  const state = {
    app: {
      version: CONFIG.VERSION,
      errors: [],
    },

    location: {
      status: "idle", // idle | seeking | ready | error
      permission: "unknown", // unknown | granted | denied
      mode: null, // gps | manual
      coords: null, // {lat, lon}
      accuracy: null, // metre

      // TR: Kullanıcının seçtiği yer (şehir + ilçe + mahalle)
      cityName: null,
      districtName: null,
      neighborhoodName: null,
    },

    iss: {
      status: "loading", // loading | live | stale | offline | error
      lastUpdatedAt: null,
      telemetry: null, // {lat, lon, altKm, velKmh, tsMs}
      lightText: null, // basit bilgi (varsa)
    },

    pass: {
      next: null, // prediction.js hesaplıyorsa buraya set edebiliriz
    },

    ui: {
      follow: true,
    },
  };

  const listeners = new Set();

  function notify() {
    for (const fn of listeners) fn(getState());
  }

  function getState() {
    return state;
  }

  function setState(next) {
    // TR: Tam replace — dikkatli kullan.
    Object.keys(state).forEach((k) => delete state[k]);
    Object.assign(state, next);
    notify();
  }

  function patch(partial) {
    Object.assign(state, partial);
    notify();
  }

  function update(mutatorFn) {
    // Türkçe yorum: State üzerinde kontrollü mutasyon. Derin merge derdi yok.
    mutatorFn(state);
    notify();
  }

  function subscribe(fn) {
    listeners.add(fn);
    fn(getState());
    return () => listeners.delete(fn);
  }

  // TR: Actions'ı boot bağlayacak (store.actions = {...})
  // Bu dosyada action tanımlamıyoruz ki boot kontrol etsin.

  return { getState, setState, patch, update, subscribe };
}
