// src/ui/components/floatingHUD.js
// Floating HUD - Simplified Mission Control v0.3.4
// Simple mode (default) + Details mode (expandable)

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

  let isDetailsMode = false;
  let isDebugMode = false;

  const render = () => {
    card.innerHTML = `
      <div class="hud-content">
        <!-- Simple Mode: Primary Metrics -->
        <div class="hud-simple">
          <div class="hud-grid">
            <div class="hud-item speeding">
              <span class="hud-label">V <small>km/h</small></span>
              <span class="hud-value" data-speed>--,---</span>
            </div>
            <div class="hud-item altitude">
              <span class="hud-label">H <small>km</small></span>
              <span class="hud-value" data-altitude>---</span>
            </div>
          </div>
          
          <!-- Toggle Buttons -->
          <div class="hud-toggles">
            <button class="hud-toggle-btn" data-toggle="details" title="${t('hudShowDetails')}">
              ${ICONS.chevronDown || '▼'}
            </button>
          </div>
        </div>

        <!-- Details Mode: Secondary Info (Hidden by default) -->
        <div class="hud-details" style="display: none;">
          <div class="hud-status-row">
            <div class="hud-status-text" data-status>${t('connectionStable')}</div>
            <div class="hud-vis-icon" data-visibility title="${t('daylight')}">${ICONS.sun}</div>
          </div>
          
          <div class="hud-location" data-location>
            <small>Lat/Lon: ---, ---</small>
          </div>

          <!-- Tools -->
          <div class="hud-tools">
            <button class="hud-btn crew-btn" title="${t('crew')}">
              ${ICONS.users || ICONS.user}
              <span>${t('crew')}</span>
            </button>
            <button class="hud-btn debug-btn" data-toggle="debug" title="${t('hudDebug')}">
              ${ICONS.terminal || '⌨'}
              <span>${t('hudDebug')}</span>
            </button>
          </div>
        </div>

        <!-- Debug/Terminal (Hidden by default) -->
        <div class="hud-debug" style="display: none;">
          <div class="hud-terminal" data-terminal>
            <div class="terminal-line">${t('hudDebugReady')}</div>
          </div>
        </div>
      </div>
    `;
  };

  render();

  // Element Cache
  let speedEl = card.querySelector("[data-speed]");
  let altEl = card.querySelector("[data-altitude]");
  let statusText = card.querySelector("[data-status]");
  let visEl = card.querySelector("[data-visibility]");
  let locationEl = card.querySelector("[data-location]");
  let terminalEl = card.querySelector("[data-terminal]");

  const detailsSection = card.querySelector(".hud-details");
  const debugSection = card.querySelector(".hud-debug");
  const detailsToggle = card.querySelector("[data-toggle='details']");
  const debugToggle = card.querySelector("[data-toggle='debug']");
  const crewBtn = card.querySelector(".crew-btn");

  let lastData = {};

  // Toggle Details
  detailsToggle?.addEventListener("click", () => {
    isDetailsMode = !isDetailsMode;
    detailsSection.style.display = isDetailsMode ? "block" : "none";
    detailsToggle.innerHTML = isDetailsMode
      ? (ICONS.chevronUp || '▲')
      : (ICONS.chevronDown || '▼');
    detailsToggle.title = isDetailsMode ? t('hudHideDetails') : t('hudShowDetails');
  });

  // Toggle Debug
  debugToggle?.addEventListener("click", () => {
    isDebugMode = !isDebugMode;
    debugSection.style.display = isDebugMode ? "block" : "none";
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

    // Secondary: Location
    if (data.latitude !== undefined && data.longitude !== undefined && locationEl) {
      locationEl.innerHTML = `<small>Lat/Lon: ${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)}</small>`;
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
      if (statusText) statusText.textContent = line.substring(0, 40);
      if (terminalEl && isDebugMode) {
        const termLine = document.createElement("div");
        termLine.className = "terminal-line";
        termLine.textContent = line.substring(0, 80);
        terminalEl.appendChild(termLine);
        // Keep last 10 lines
        while (terminalEl.children.length > 10) {
          terminalEl.removeChild(terminalEl.firstChild);
        }
      }
    },
    getLogFn() {
      return (line) => this.log(line);
    }
  };
}
