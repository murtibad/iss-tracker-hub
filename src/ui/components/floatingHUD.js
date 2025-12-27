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


  // Theme application function
  function applyTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      card.style.background = 'rgba(255, 255, 255, 0.95)';
      card.style.borderColor = 'rgba(0, 0, 0, 0.15)';
      card.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)';
    } else {
      card.style.background = '';
      card.style.borderColor = '';
      card.style.boxShadow = '';
    }
  }

  // Render Function - Simplified HUD (Speed + Altitude only)
  const render = () => {
    // Store style before innerHTML wipe
    const existingStyle = card.querySelector('style');

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

    // Re-add style element
    if (existingStyle) {
      card.insertBefore(existingStyle, card.firstChild);
    } else {
      card.insertBefore(style, card.firstChild);
    }

    // Apply current theme
    applyTheme();
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

  // Theme Change Listener - Apply theme when it changes
  window.addEventListener('themeChanged', () => {
    applyTheme();
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
