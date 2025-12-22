// src/ui/components/dockedDashboard.js
// Docked Bottom Bar - Unified Command Deck v0.3.1
// Grid: 25% (Data) | 50% (Status) | 25% (Controls)

import { openCrewModal } from "../crewWidgetView.js";
import { getSmartUnits, t, getCurrentLanguage } from "../../i18n/i18n.js";
import { ICONS } from "../icons.js";

/**
 * Creates a docked bottom dashboard bar with smart units
 * @param {Object} options - { onViewModeChange: (mode) => void }
 * @returns {Object} Dashboard element and control methods
 */
export function createDockedDashboard(options = {}) {
  const bar = document.createElement("div");
  bar.className = "docked-dashboard";

  // Initial render helper
  const render = () => {
    bar.innerHTML = `
    <div class="docked-dashboard-inner">
      <div class="dd-content">
        <!-- LEFT: Data Zone (25%) -->
        <div class="dd-left">
          <div class="dd-data-stack">
            <div class="dd-speed-row">
              <span class="dd-speed-value" data-speed>--,---</span>
              <span class="dd-speed-unit" data-speed-unit>km/h</span>
              <span class="dd-visibility" data-visibility>${ICONS.sun}</span>
            </div>
            <div class="dd-alt-row">
              <span class="dd-alt-icon">${ICONS.arrowUp}</span>
              <span class="dd-alt-value" data-altitude>---</span>
              <span class="dd-alt-unit" data-alt-unit>km</span>
            </div>
          </div>
        </div>
        
        <!-- CENTER: Status Line (50%) -->
        <div class="dd-center">
          <div class="dd-status-line">
            <span class="dd-status-text" data-status>${t('connectionStable')}</span>
          </div>
        </div>
        
        <!-- RIGHT: Controls Zone (25%) -->
        <div class="dd-right">
          <div class="dd-view-toggle" data-view-toggle>
            <button class="dd-view-btn active" data-view="2d" title="2D Map">${ICONS.map || '2D'}</button>
            <button class="dd-view-btn" data-view="3d" title="3D Globe">${ICONS.globe || '3D'}</button>
          </div>
          <button class="dd-btn dd-crew-btn" title="${t('crew')}">${ICONS.user}</button>
        </div>
      </div>
    </div>
  `;
  };

  render();

  // Elements (Re-query functionality handled in bindEvents if needed, but here we do it once per render)
  // To handle re-render on language change, we might need a better strategy, 
  // but for hotfix, we will update text content only via update() and listeners.

  let speedEl = bar.querySelector("[data-speed]");
  let speedUnitEl = bar.querySelector("[data-speed-unit]");
  let altEl = bar.querySelector("[data-altitude]");
  let altUnitEl = bar.querySelector("[data-alt-unit]");
  let visEl = bar.querySelector("[data-visibility]");
  let statusText = bar.querySelector("[data-status]");
  let crewBtn = bar.querySelector(".dd-crew-btn");
  let viewBtns = bar.querySelectorAll("[data-view]");

  // State
  let currentViewMode = "2d";
  let lastData = {}; // Cache for re-render

  // Functions to re-bind events after render
  function bindEvents() {
    // Crew button
    crewBtn.addEventListener("click", () => openCrewModal());

    // View mode toggle (2D/3D)
    viewBtns.forEach(btn => {
      // Restore active state
      if (btn.dataset.view === currentViewMode) btn.classList.add("active");
      else btn.classList.remove("active");

      btn.addEventListener("click", () => {
        const mode = btn.dataset.view;
        if (mode !== currentViewMode) {
          currentViewMode = mode;
          viewBtns.forEach(b => b.classList.toggle("active", b.dataset.view === mode));
          if (options.onViewModeChange) {
            options.onViewModeChange(mode);
          }
        }
      });
    });
  }

  bindEvents();

  // Listen for language changes
  window.addEventListener('language-change', () => {
    // Re-render strings
    statusText.textContent = t('connectionStable');
    crewBtn.title = t('crew');

    // Force unit update immediately (even if data is stale)
    const vel = lastData.velocity || 0;
    const alt = lastData.altitude || 0;
    const { speedUnit, altUnit } = getSmartUnits(vel, alt);

    if (speedUnitEl) speedUnitEl.textContent = speedUnit;
    if (altUnitEl) altUnitEl.textContent = altUnit;

    // Trigger update with last data to refresh converted values
    if (lastData.velocity) update(lastData);
  });

  function update(data) {
    lastData = { ...lastData, ...data }; // Merge cache

    if (data.velocity !== undefined && data.altitude !== undefined) {
      const { speed, speedUnit, altitude, altUnit } = getSmartUnits(data.velocity, data.altitude);

      if (speedEl) speedEl.textContent = speed;
      if (speedUnitEl) speedUnitEl.textContent = speedUnit;
      if (altEl) altEl.textContent = altitude;
      if (altUnitEl) altUnitEl.textContent = altUnit;
    }

    if (data.visibility !== undefined) {
      const isDaylight = data.visibility === "daylight" || data.visibility === true;
      if (visEl) {
        visEl.innerHTML = isDaylight ? ICONS.sun : ICONS.moon;
        visEl.title = isDaylight ? t('daylight') : t('eclipse');
      }
    }
  }

  return {
    el: bar,
    update,

    /**
     * Add log line to status ticker (Simpler log)
     */
    log(line) {
      // Status line shows last message
      if (statusText) statusText.textContent = line.substring(0, 60);
    },

    /**
     * Get log function for external use
     */
    getLogFn() {
      return (line) => this.log(line);
    }
  };
}
