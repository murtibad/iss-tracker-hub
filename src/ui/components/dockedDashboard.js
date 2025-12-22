// src/ui/components/dockedDashboard.js
// Docked Bottom Bar - Unified Dashboard
// Left: Telemetry | Center: Terminal (minimizable) | Right: Actions

import { openCrewModal } from "../crewWidgetView.js";

/**
 * Creates a docked bottom dashboard bar
 * @returns {Object} Dashboard element and control methods
 */
export function createDockedDashboard() {
    const bar = document.createElement("div");
    bar.className = "docked-dashboard";

    bar.innerHTML = `
    <div class="dd-content">
      <!-- LEFT: Telemetry -->
      <div class="dd-left">
        <div class="dd-stat dd-speed">
          <span class="dd-icon">⚡</span>
          <span class="dd-value" data-speed>--,---</span>
          <span class="dd-unit">km/h</span>
        </div>
        <div class="dd-divider"></div>
        <div class="dd-stat dd-altitude">
          <span class="dd-icon">↑</span>
          <span class="dd-value" data-altitude>---</span>
          <span class="dd-unit">km</span>
        </div>
        <div class="dd-divider"></div>
        <div class="dd-stat dd-coords">
          <span class="dd-icon">📍</span>
          <span class="dd-value dd-coord-value">
            <span data-lat>--°</span>, <span data-lon>--°</span>
          </span>
        </div>
        <div class="dd-visibility" data-visibility title="Gündüz/Gece">☀️</div>
      </div>
      
      <!-- CENTER: Terminal (Minimizable) -->
      <div class="dd-center">
        <div class="dd-terminal-header" data-terminal-toggle>
          <span class="dd-term-title">TERMINAL</span>
          <span class="dd-term-toggle" data-toggle-icon>▲</span>
        </div>
        <div class="dd-terminal-body" data-terminal-body>
          <div class="dd-term-content" data-terminal-content></div>
        </div>
      </div>
      
      <!-- RIGHT: Actions -->
      <div class="dd-right">
        <button class="dd-btn dd-crew-btn" title="Mürettebat">👤</button>
      </div>
    </div>
  `;

    // Elements
    const speedEl = bar.querySelector("[data-speed]");
    const altEl = bar.querySelector("[data-altitude]");
    const latEl = bar.querySelector("[data-lat]");
    const lonEl = bar.querySelector("[data-lon]");
    const visEl = bar.querySelector("[data-visibility]");
    const termToggle = bar.querySelector("[data-terminal-toggle]");
    const termBody = bar.querySelector("[data-terminal-body]");
    const termContent = bar.querySelector("[data-terminal-content]");
    const toggleIcon = bar.querySelector("[data-toggle-icon]");
    const crewBtn = bar.querySelector(".dd-crew-btn");

    // Terminal state
    let terminalExpanded = false;
    let logLines = [];

    // Terminal toggle
    termToggle.addEventListener("click", () => {
        terminalExpanded = !terminalExpanded;
        termBody.classList.toggle("expanded", terminalExpanded);
        toggleIcon.textContent = terminalExpanded ? "▼" : "▲";
    });

    // Crew button
    crewBtn.addEventListener("click", () => openCrewModal());

    return {
        el: bar,

        /**
         * Update telemetry display
         */
        update(data) {
            if (data.velocity !== undefined) {
                speedEl.textContent = Math.round(data.velocity).toLocaleString("tr-TR");
            }
            if (data.altitude !== undefined) {
                altEl.textContent = data.altitude.toFixed(1);
            }
            if (data.latitude !== undefined) {
                latEl.textContent = data.latitude.toFixed(2) + "°";
            }
            if (data.longitude !== undefined) {
                lonEl.textContent = data.longitude.toFixed(2) + "°";
            }
            if (data.visibility !== undefined) {
                const isDaylight = data.visibility === "daylight" || data.visibility === true;
                visEl.textContent = isDaylight ? "☀️" : "🌙";
            }
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

            // Show last line in minimized state, all in expanded
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
