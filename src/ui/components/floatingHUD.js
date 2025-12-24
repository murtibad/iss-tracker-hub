// src/ui/components/floatingHUD.js
// Floating HUD - Simplified Mission Control v0.3.4
// Phase 6: Visual Refinement (Strict 18px+, Hero Metrics)

import { openCrewModal } from "../crewWidgetView.js";
import { getSmartUnits, t } from "../../i18n/i18n.js";
import { ICONS } from "../icons.js";

/**
 * Creates a floating HUD card with Simple/Details modes
 * @param {Object} options - Configuration options
 * @returns {Object} HUD element and control methods
 */
export function createFloatingHUD(options = {}) {
  const card = document.createElement("div");
  card.className = "floating-hud glass-panel";

  // Phase 6 Style Overrides
  const style = document.createElement("style");
  style.textContent = `
    .hud-metric { display: flex; flex-direction: column; align-items: start; }
    .hud-label { 
        font-size: 18px !important; /* Strict 18px */
        font-weight: 700; 
        color: var(--muted); 
        letter-spacing: 1px;
    }
    .hud-value { 
        font-size: 32px !important; /* Hero Size */
        font-weight: 800; 
        color: var(--text);
        line-height: 1.1;
    }
    .hud-unit { 
        font-size: 18px !important; 
        color: var(--accent);
        font-weight: 600;
    }
    .hud-coord-label { font-size: 18px !important; color: var(--muted); }
    .hud-coord-value { font-size: 20px !important; font-weight: 700; }
    .hud-status-pill { font-size: 18px !important; padding: 4px 12px; }
    .hud-vis-icon { font-size: 24px !important; }
  `;
  card.appendChild(style);

  let isDetailsMode = false;
  let isDebugMode = false;

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
              <span class="hud-label">VELOCITY</span>
              <span class="hud-value" data-speed>--</span>
              <span class="hud-unit">KM/H</span>
            </div>
            <div class="hud-metric">
              <span class="hud-label">ALTITUDE</span>
              <span class="hud-value" data-altitude>--</span>
              <span class="hud-unit">KM</span>
            </div>
          </div>

          <!-- Center: Status & Location -->
          <div class="hud-section status">
             <div class="hud-location-box">
                <span class="hud-coord-label">LAT / LON</span>
                <span class="hud-coord-value" data-location>--.--, --.--</span>
             </div>
             <div class="hud-meta-row">
                <div class="hud-status-pill" data-status>${t('connectionStable')}</div>
                <div class="hud-vis-icon" data-visibility>${ICONS.sun}</div>
             </div>
          </div>

          <!-- Right: Controls -->
          <div class="hud-section controls">
             <button class="btn-cyber-mini crew-btn" title="${t('crew')}" style="font-size: 18px;">
                ${ICONS.users} <span style="font-size: 18px; font-weight: 700;">CREW</span>
             </button>
             <button class="btn-cyber-mini debug-btn" data-toggle="debug" title="LOGS" style="font-size: 18px;">
                ${ICONS.terminal || 'TERM'}
             </button>
          </div>
        </div>

        <!-- Debug Terminal (Collapsible) -->
        <div class="hud-debug-panel" style="display: none;">
           <div class="hud-terminal-header">SYSTEM LOGS</div>
           <div class="hud-terminal-content" data-terminal></div>
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
  const terminalContainer = card.querySelector("[data-terminal]");

  const debugPanel = card.querySelector(".hud-debug-panel");
  const debugToggle = card.querySelector("[data-toggle='debug']");
  const crewBtn = card.querySelector(".crew-btn");

  let lastData = {};

  // Toggle Debug
  debugToggle?.addEventListener("click", () => {
    isDebugMode = !isDebugMode;
    const isVisible = debugPanel.style.display !== 'none';
    debugPanel.style.display = isVisible ? 'none' : 'block';
    if (debugToggle) debugToggle.classList.toggle('active', !isVisible);
  });

  // Crew Button
  crewBtn?.addEventListener("click", () => openCrewModal());

  // Language Listener
  window.addEventListener('language-change', () => {
    if (statusText) statusText.textContent = t('connectionStable');
    if (crewBtn) {
      crewBtn.setAttribute('title', t('crew'));
      crewBtn.querySelector('span').textContent = t('crew');
    }
    if (debugToggle) {
      debugToggle.setAttribute('title', t('hudDebug'));
      debugToggle.querySelector('span').textContent = t('hudDebug');
    }
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
    update,
    log(line) {
      if (statusEl) statusEl.textContent = line.substring(0, 30);
      if (terminalContainer) {
        const termLine = document.createElement("div");
        termLine.className = "terminal-line";
        termLine.textContent = `> ${line}`;
        terminalContainer.appendChild(termLine);
        // Keep last 10 lines
        while (terminalContainer.children.length > 8) {
          terminalContainer.removeChild(terminalContainer.firstChild);
        }
        terminalContainer.scrollTop = terminalContainer.scrollHeight;
      }
    },
    getLogFn() {
      return (line) => this.log(line);
    }
  };
}
