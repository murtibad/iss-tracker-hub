// src/ui/locationWelcomeModal.js
// First-time user location setup modal

import { getCurrentLocation, reverseGeocode } from "../services/geocoding.js";

const STORAGE_KEY = "isshub:userLocation";

/**
 * Check if user location is saved
 */
export function hasStoredLocation() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Get stored location
 */
export function getStoredLocation() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Save user location
 */
export function saveLocation(location) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
}

/**
 * Show location welcome modal for first-time users
 * @param {Function} onLocationSet - Callback when location is set
 * @param {Function} onManualEntry - Callback when user chooses manual entry
 */
export function showLocationWelcome(onLocationSet, onManualEntry) {
  if (hasStoredLocation()) {
    // Already have location, use it
    const stored = getStoredLocation();
    if (stored && onLocationSet) {
      onLocationSet(stored);
    }
    return;
  }

  // Create modal
  const overlay = document.createElement("div");
  overlay.className = "welcome-overlay";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    z-index: 5000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

  const card = document.createElement("div");
  card.className = "welcome-card hub-glass";
  card.style.cssText = `
    max-width: 500px;
    width: 100%;
    padding: 32px;
    text-align: center;
  `;

  card.innerHTML = `
    <div class="welcome-icon" style="font-size: 64px; margin-bottom: 16px;">🌍</div>
    <h2 style="font-weight: 900; font-size: 24px; margin-bottom: 12px;">
      ISS'i Görmek İster misin?
    </h2>
    <p style="color: var(--muted); font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      ISS'in ne zaman gökyüzünde görünebileceğini hesaplamak için konumunuza ihtiyacımız var.
    </p>
    
    <div class="welcome-buttons" style="display: flex; flex-direction: column; gap: 12px;">
      <button type="button" class="btn-auto-location" style="
        padding: 14px 24px;
        border-radius: 12px;
        background: var(--accent);
        color: #000;
        border: none;
        font-weight: 800;
        font-size: 15px;
        cursor: pointer;
        transition: all 150ms;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      ">
        <span>📍</span>
        <span>Konumu Otomatik Tespit Et</span>
      </button>
      
      <button type="button" class="btn-manual-location" style="
        padding: 14px 24px;
        border-radius: 12px;
        background: var(--card2);
        color: var(--text);
        border: 1px solid var(--ring);
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
        transition: all 150ms;
      ">
        Manuel Gir
      </button>
    </div>
    
    <div class="welcome-status" style="margin-top: 16px; min-height: 20px; font-size: 13px; color: var(--muted);"></div>
  `;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  const autoBtn = card.querySelector(".btn-auto-location");
  const manualBtn = card.querySelector(".btn-manual-location");
  const statusDiv = card.querySelector(".welcome-status");

  // Auto detection
  autoBtn.addEventListener("click", async () => {
    autoBtn.disabled = true;
    manualBtn.disabled = true;
    statusDiv.textContent = "🔍 Konum tespit ediliyor...";

    try {
      const coords = await getCurrentLocation();
      statusDiv.textContent = "🌐 Adres bilgisi alınıyor...";

      const address = await reverseGeocode(coords.lat, coords.lon);

      const location = {
        lat: coords.lat,
        lon: coords.lon,
        displayName: address.displayName,
        address: address.address,
        method: "auto"
      };

      saveLocation(location);

      statusDiv.innerHTML = `✅ <span style="color: var(--good);">Konum ayarlandı!</span>`;

      setTimeout(() => {
        overlay.remove();
        if (onLocationSet) onLocationSet(location);
      }, 1000);

    } catch (error) {
      statusDiv.innerHTML = `❌ <span style="color: var(--bad);">Konum izni reddedildi veya alınamadı</span>`;
      autoBtn.disabled = false;
      manualBtn.disabled = false;

      // Show manual input after 2 seconds
      setTimeout(() => {
        statusDiv.textContent = "Manuel giriş kullanabilirsiniz";
      }, 2000);
    }
  });

  // Manual input
  manualBtn.addEventListener("click", () => {
    overlay.remove();
    // Call manual entry callback
    if (onManualEntry) {
      onManualEntry();
    }
  });
}
