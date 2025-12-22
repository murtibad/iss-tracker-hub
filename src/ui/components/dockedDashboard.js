// src/ui/components/dockedDashboard.js
// Docked Bottom Bar - Unified Command Deck v0.3.0
// Grid: 25% (Data) | 50% (Status) | 25% (Controls)

import { openCrewModal } from "../crewWidgetView.js";
import { getCurrentLanguage } from "../../i18n/i18n.js";

/**
 * Creates a docked bottom dashboard bar with smart units
 * @param {Object} options - { onViewModeChange: (mode) => void }
 * @returns {Object} Dashboard element and control methods
 */
export function createDockedDashboard(options = {}) {
  const bar = document.createElement("div");
  bar.className = "docked-dashboard";

  bar.innerHTML = `
    <div class="dd-content">
      <!-- LEFT: Data Zone (25%) -->
      <div class="dd-left">
        <div class="dd-data-stack">
          <div class="dd-speed-row">
            <span class="dd-speed-value" data-speed>--,---</span>
            <span class="dd-speed-unit" data-speed-unit>km/h</span>
            <span class="dd-visibility" data-visibility>☀️</span>
          </div>
          <div class="dd-alt-row">
            <span class="dd-alt-icon">↑</span>
            <span class="dd-alt-value" data-altitude>---</span>
            <span class="dd-alt-unit" data-alt-unit>km</span>
          </div>
        </div>
      </div>
      
      <!-- CENTER: Status Line (50%) -->
      <div class="dd-center">
        <div class="dd-status-line" data-terminal-toggle>
          <span class="dd-status-text" data-status>Connection stable</span>
          <span class="dd-status-toggle" data-toggle-icon>▲</span>
        </div>
        <div class="dd-status-drawer" data-terminal-body>
          <div class="dd-drawer-content" data-terminal-content></div>
        </div>
      </div>
      
      <!-- RIGHT: Controls Zone (25%) -->
      <div class="dd-right">
        <div class="dd-view-toggle" data-view-toggle>
          <button class="dd-view-btn active" data-view="2d">2D</button>
          <button class="dd-view-btn" data-view="3d">3D</button>
        </div>
        <button class="dd-btn dd-crew-btn" title="Mürettebat">👤</button>
      </div>
    </div>
  `;

  // Elements
  const speedEl = bar.querySelector("[data-speed]");
  const speedUnitEl = bar.querySelector("[data-speed-unit]");
  const altEl = bar.querySelector("[data-altitude]");
  const altUnitEl = bar.querySelector("[data-alt-unit]");
  const visEl = bar.querySelector("[data-visibility]");
  const statusText = bar.querySelector("[data-status]");
  const termToggle = bar.querySelector("[data-terminal-toggle]");
  const termBody = bar.querySelector("[data-terminal-body]");
  const termContent = bar.querySelector("[data-terminal-content]");
  const toggleIcon = bar.querySelector("[data-toggle-icon]");
  const crewBtn = bar.querySelector(".dd-crew-btn");
  const viewBtns = bar.querySelectorAll("[data-view]");

  // State
  let terminalExpanded = false;
  let logLines = [];
  let currentViewMode = "2d";

  // Terminal toggle
  termToggle.addEventListener("click", () => {
    terminalExpanded = !terminalExpanded;
    termBody.classList.toggle("expanded", terminalExpanded);
    toggleIcon.textContent = terminalExpanded ? "▼" : "▲";
  });

  // Crew button
  crewBtn.addEventListener("click", () => openCrewModal());

  // View mode toggle (2D/3D)
  viewBtns.forEach(btn => {
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

  /**
   * Format value with smart units based on language
   * EN = Imperial (mph, miles), TR = Metric (km/h, km)
   */
  function formatWithUnits(kmhValue, kmValue) {
    const lang = getCurrentLanguage();
    const isImperial = lang === "en";

    if (isImperial) {
      return {
        speed: Math.round(kmhValue * 0.621371).toLocaleString("en-US"),
        speedUnit: "mph",
        altitude: (kmValue * 0.621371).toFixed(1),
        altUnit: "mi"
      };
    } else {
      return {
        speed: Math.round(kmhValue).toLocaleString("tr-TR"),
        speedUnit: "km/h",
        altitude: kmValue.toFixed(1),
        altUnit: "km"
      };
    }
  }

  return {
    el: bar,

    /**
     * Update telemetry display with smart units
     */
    update(data) {
      if (data.velocity !== undefined && data.altitude !== undefined) {
        const formatted = formatWithUnits(data.velocity, data.altitude);
        speedEl.textContent = formatted.speed;
        speedUnitEl.textContent = formatted.speedUnit;
        altEl.textContent = formatted.altitude;
        altUnitEl.textContent = formatted.altUnit;
      } else {
        if (data.velocity !== undefined) {
          const lang = getCurrentLanguage();
          if (lang === "en") {
            speedEl.textContent = Math.round(data.velocity * 0.621371).toLocaleString("en-US");
            speedUnitEl.textContent = "mph";
          } else {
            speedEl.textContent = Math.round(data.velocity).toLocaleString("tr-TR");
            speedUnitEl.textContent = "km/h";
          }
        }
        if (data.altitude !== undefined) {
          const lang = getCurrentLanguage();
          if (lang === "en") {
            altEl.textContent = (data.altitude * 0.621371).toFixed(1);
            altUnitEl.textContent = "mi";
          } else {
            altEl.textContent = data.altitude.toFixed(1);
            altUnitEl.textContent = "km";
          }
        }
      }

      if (data.visibility !== undefined) {
        const isDaylight = data.visibility === "daylight" || data.visibility === true;
        visEl.textContent = isDaylight ? "☀️" : "🌙";
      }
    },

    /**
     * Set view mode (2d/3d)
     */
    setViewMode(mode) {
      currentViewMode = mode;
      viewBtns.forEach(b => b.classList.toggle("active", b.dataset.view === mode));
    },

    /**
     * Add log line to terminal
     */
    log(line) {
      const ts = new Date();
      const stamp = `${ts.getHours().toString().padStart(2, "0")}:${ts.getMinutes().toString().padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;
      const msg = `[${stamp}] ${line}`;
      logLines.push(msg);
      if (logLines.length > 100) logLines.shift();

      // Status line shows last message, drawer shows all
      statusText.textContent = line.substring(0, 60) + (line.length > 60 ? "..." : "");

      if (terminalExpanded) {
        termContent.textContent = logLines.join("\n");
      } else {
        termContent.textContent = logLines[logLines.length - 1] || "";
      }
      termContent.scrollTop = termContent.scrollHeight;
    },

    /**
     * Get log function for external use
     */
    getLogFn() {
      return (line) => this.log(line);
    }
  };
}
