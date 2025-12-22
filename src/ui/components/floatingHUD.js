// src/ui/components/floatingHUD.js
// Floating HUD - Compact Mission Control v0.3.3
// Replaces Docked Dashboard

import { openCrewModal } from "../crewWidgetView.js";
import { getSmartUnits, t } from "../../i18n/i18n.js";
import { ICONS } from "../icons.js";

/**
 * Creates a floating HUD card
 * @param {Object} options - { onViewModeChange: (mode) => void } (kept for compat)
 * @returns {Object} HUD element and control methods
 */
export function createFloatingHUD(options = {}) {
  const card = document.createElement("div");
  card.className = "floating-hud glass-panel";

  const render = () => {
    card.innerHTML = `
      <div class="hud-content">
        <!-- Top Row: Data Grid -->
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

        <!-- Middle Row: Status & Vis -->
        <div class="hud-status-row">
            <div class="hud-status-text" data-status>${t('connectionStable')}</div>
            <div class="hud-vis-icon" data-visibility title="${t('daylight')}">${ICONS.sun}</div>
        </div>

        <!-- Bottom Row: Tools -->
        <div class="hud-tools">
            <button class="hud-btn crew-btn" title="${t('crew')}">
                ${ICONS.users || ICONS.user}
                <span>${t('crew')}</span>
            </button>
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
  let crewBtn = card.querySelector(".crew-btn");

  let lastData = {};

  // Bind Events
  crewBtn.addEventListener("click", () => openCrewModal());

  // Language Listener
  window.addEventListener('language-change', () => {
    statusText.textContent = t('connectionStable');
    crewBtn.setAttribute('title', t('crew'));
    crewBtn.querySelector('span').textContent = t('crew');

    if (lastData.velocity) update(lastData);
  });

  function update(data) {
    lastData = { ...lastData, ...data };

    // Fallbacks if data missing (prevents --,--- flickering on init)
    const velocity = data.velocity ?? lastData.velocity ?? 27580;
    const altitude = data.altitude ?? lastData.altitude ?? 420;

    const { speed, speedUnit, altitude: altFmt, altUnit } = getSmartUnits(velocity, altitude);

    if (speedEl) speedEl.textContent = speed;
    if (altEl) altEl.textContent = altFmt;
    // Note: We are using fixed units (km/h, km) labels in HTML for this compact design.
    // If we support Imperial, we'd need to update the <small> tags too.
    // For now assuming Metric/SI as default.

    if (data.visibility !== undefined) {
      const isDaylight = data.visibility === "daylight" || data.visibility === true;
      if (visEl) {
        visEl.innerHTML = isDaylight ? ICONS.sun : ICONS.moon;
        visEl.title = isDaylight ? t('daylight') : t('eclipse');
        visEl.className = `hud-vis-icon ${isDaylight ? 'day' : 'night'}`;
      }
    }
  }

  // Initial update to populate default values
  update({ velocity: 27580, altitude: 420, visibility: "daylight" });

  return {
    el: card,
    update,
    log(line) {
      if (statusText) statusText.textContent = line.substring(0, 40);
    },
    getLogFn() {
      return (line) => this.log(line);
    }
  };
}
