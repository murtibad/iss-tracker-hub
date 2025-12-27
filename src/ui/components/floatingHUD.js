// src/ui/components/floatingHUD.js
// Floating HUD - Simplified Mission Control v0.4
// Shows only Speed and Altitude - clean and minimal

import { getSmartUnits, t } from "../../i18n/i18n.js";

/**
 * Creates a floating HUD card displaying ISS telemetry
 * @param {Object} options - Configuration options
 * @returns {Object} HUD element and control methods
 */
export function createFloatingHUD(options = {}) {
  const card = document.createElement("div");
  card.className = "floating-hud glass-panel";

  // Simplified Style - Only Speed + Altitude metrics
  const style = document.createElement("style");
  style.textContent = `
    .hud-metric { display: flex; flex-direction: column; align-items: start; min-width: 110px; }
    .hud-label { 
        font-size: 14px !important; 
        font-weight: 700; 
        color: var(--muted); 
        letter-spacing: 1px;
        margin-bottom: 6px;
    }
    .hud-value { 
        font-size: 36px !important; 
        font-weight: 800; 
        color: var(--text);
        line-height: 1;
        margin-bottom: 4px;
    }
    .hud-unit { 
        font-size: 14px !important; 
        color: var(--accent);
        font-weight: 600;
        opacity: 0.8;
    }
  `;
  card.appendChild(style);


  // Render Function - Simplified HUD (Speed + Altitude only)
  const render = () => {
    card.innerHTML = `
      <div class="hud-dashboard">
        <!-- Decoration: Top Border Line -->
        <div class="hud-deco-line"></div>
        
        <div class="hud-main-row">
          <!-- Telemetry Only -->
          <div class="hud-section telemetry" style="border-right: none;">
            <div class="hud-metric">
              <span class="hud-label">${t('speed') || 'HIZ'}</span>
              <span class="hud-value" data-speed>--</span>
              <span class="hud-unit">KM/H</span>
            </div>
            <div class="hud-metric">
              <span class="hud-label">${t('altitude') || 'YÜKSEKLİK'}</span>
              <span class="hud-value" data-altitude>--</span>
              <span class="hud-unit">KM</span>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  render(); // Initial Render

  // Element Cache (only speed and altitude now)
  const speedEl = card.querySelector("[data-speed]");
  const altEl = card.querySelector("[data-altitude]");

  let lastData = {};

  // Language Listener - Re-render on language change
  window.addEventListener('language-change', () => {
    render();
    // Re-update data display
    if (lastData.velocity) update(lastData);
  });

  function update(data) {
    lastData = { ...lastData, ...data };

    // Primary: Speed + Altitude only
    const velocity = data.velocity ?? lastData.velocity ?? 27580;
    const altitude = data.altitude ?? lastData.altitude ?? 420;
    const { speed, altitude: altFmt } = getSmartUnits(velocity, altitude);

    if (speedEl) speedEl.textContent = speed;
    if (altEl) altEl.textContent = altFmt;
  }

  // Initial update
  update({ velocity: 27580, altitude: 420 });

  return {
    el: card,
    update
  };
}
