// src/ui/components/floatingHUD.js
// Floating HUD - Simplified Mission Control v0.3.5
// Phase 6: Visual Refinement (Strict 18px+, Hero Metrics)
// Terminal/Debug removed - Crew moved to Help modal

import { getSmartUnits, t } from "../../i18n/i18n.js";
import { ICONS } from "../icons.js";

// API definitions for status monitoring
const API_DEFS = [
  { key: 'wheretheiss', icon: '🛰️' },
  { key: 'opennotify', icon: '📡' },
  { key: 'openmeteo', icon: '🌤️' },
  { key: 'nominatim', icon: '📍' }
];

/**
 * Creates a floating HUD card displaying ISS telemetry
 * @param {Object} options - Configuration options
 * @returns {Object} HUD element and control methods
 */
export function createFloatingHUD(options = {}) {
  const card = document.createElement("div");
  card.className = "floating-hud glass-panel";

  // Phase 6 Style Overrides
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
    .hud-coord-label { font-size: 14px !important; color: var(--muted); margin-bottom: 4px; }
    .hud-coord-value { font-size: 18px !important; font-weight: 700; font-family: var(--font-mono); }
    .hud-status-pill { font-size: 14px !important; padding: 6px 12px; margin-right: 8px; cursor: pointer; transition: all 0.2s; }
    .hud-status-pill:hover { background: rgba(255,255,255,0.1); }
    .hud-vis-icon { font-size: 28px !important; }
    
    /* API Status Mini Icons */
    .hud-api-status { display: flex; gap: 4px; align-items: center; margin-right: 12px; }
    .api-dot { width: 6px; height: 6px; border-radius: 50%; opacity: 0.5; }
    .api-dot.active { opacity: 1; box-shadow: 0 0 5px currentColor; }
    .api-dot.loading { animation: pulse 1s infinite; }
    @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
  `;
  card.appendChild(style);

  // Render Function - Cyberpunk Dashboard Style
  const render = () => {
    card.innerHTML = `
      <div class="hud-dashboard">
        <!-- Decoration: Top Border Line -->
        <div class="hud-deco-line"></div>
        
        <div class="hud-main-row">
          <!-- Left: Telemetry -->
          <div class="hud-section telemetry">
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

          <!-- Center: Status & Location -->
          <div class="hud-section status">
             <div class="hud-location-box">
                <span class="hud-coord-label">${t('location') || 'KONUM'}</span>
                <span class="hud-coord-value" data-location>--.--, --.--</span>
             </div>
             <div class="hud-meta-row">
                <div class="hud-api-status" title="API Status">
                    ${API_DEFS.map(api => `<span class="api-dot" data-api-dot="${api.key}" title="${api.key}"></span>`).join('')}
                </div>
                <div class="hud-status-pill" data-status>${t('connectionStable')}</div>
                <div class="hud-vis-icon" data-visibility>${ICONS.sun}</div>
             </div>
          </div>
        </div>
      </div>
    `;
  };

  render(); // Initial Render

  // Element Cache
  const speedEl = card.querySelector("[data-speed]");
  const altEl = card.querySelector("[data-altitude]");
  const statusEl = card.querySelector("[data-status]");
  const visEl = card.querySelector("[data-visibility]");
  const locationEl = card.querySelector("[data-location]");
  const apiDots = card.querySelectorAll("[data-api-dot]");

  let lastData = {};
  const store = options.store;

  // Store Subscription for API status
  if (store) {
    store.subscribe((state) => {
      const apis = state.apis || {};
      apiDots.forEach(dot => {
        const key = dot.dataset.apiDot;
        const apiState = apis[key] || {};
        const status = apiState.status || 'idle';

        dot.className = `api-dot ${status}`;
        if (status === 'active' || status === 'loading') {
          dot.style.color = 'var(--accent)';
          dot.classList.add('active');
        } else if (status === 'error') {
          dot.style.color = '#ff4444';
          dot.classList.add('active');
        } else {
          dot.style.color = 'gray';
          dot.classList.remove('active');
        }
      });

      // Update aggregate status pill if error
      const hasError = Object.values(apis).some(a => a.status === 'error');
      if (hasError && statusEl) {
        statusEl.textContent = t('connectionError') || 'Sorun var';
        statusEl.style.color = '#ff4444';
      } else if (statusEl) {
        statusEl.textContent = t('connectionStable');
        statusEl.style.color = '';
      }
    });
  }

  // Language Listener - Re-render on language change
  window.addEventListener('language-change', () => {
    render();
    // Re-update data display
    if (lastData.velocity) update(lastData);
  });

  function update(data) {
    lastData = { ...lastData, ...data };

    // Primary: Speed + Altitude
    const velocity = data.velocity ?? lastData.velocity ?? 27580;
    const altitude = data.altitude ?? lastData.altitude ?? 420;
    const { speed, altitude: altFmt } = getSmartUnits(velocity, altitude);

    if (speedEl) speedEl.textContent = speed;
    if (altEl) altEl.textContent = altFmt;

    // Location
    if (data.latitude !== undefined && data.longitude !== undefined && locationEl) {
      locationEl.textContent = `${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)}`;
    }

    // Visibility
    if (data.visibility !== undefined && visEl) {
      const isDaylight = data.visibility === "daylight" || data.visibility === true;
      visEl.innerHTML = isDaylight ? ICONS.sun : ICONS.moon;
      visEl.title = isDaylight ? t('daylight') : t('eclipse');
      visEl.className = `hud-vis-icon ${isDaylight ? 'day' : 'night'}`;
    }
  }

  // Initial update
  update({ velocity: 27580, altitude: 420, visibility: "daylight" });

  return {
    el: card,
    update
  };
}
