// src/ui/widgets/smartInfoCard.js
// Minimalist Smart Info Card - Essential ISS Data Only
// Speed, Altitude, Day/Night indicator, Crew button

import { openCrewModal } from "../crewWidgetView.js";

/**
 * Creates a minimalist floating glass card with essential ISS data
 * @returns {Object} Card element and update function
 */
export function createSmartInfoCard() {
    const card = document.createElement("div");
    card.className = "smart-info-card";

    card.innerHTML = `
    <div class="sic-main">
      <div class="sic-speed">
        <span class="sic-speed-icon">⚡</span>
        <span class="sic-speed-value" data-speed>--,---</span>
        <span class="sic-speed-unit">km/h</span>
      </div>
      
      <div class="sic-secondary">
        <div class="sic-altitude">
          <span class="sic-alt-icon">↑</span>
          <span data-altitude>---</span>
          <span class="sic-alt-unit">km</span>
        </div>
        
        <div class="sic-visibility" data-visibility title="Gündüz/Gece">
          ☀️
        </div>
        
        <button class="sic-crew-btn" title="Mürettebat">
          👤
        </button>
      </div>
    </div>
  `;

    // Elements for updates
    const speedEl = card.querySelector("[data-speed]");
    const altEl = card.querySelector("[data-altitude]");
    const visEl = card.querySelector("[data-visibility]");
    const crewBtn = card.querySelector(".sic-crew-btn");

    // Crew button handler
    crewBtn.addEventListener("click", () => {
        openCrewModal();
    });

    return {
        el: card,

        /**
         * Update card with telemetry data
         * @param {Object} data - { velocity, altitude, visibility }
         */
        update(data) {
            if (data.velocity !== undefined) {
                const speed = Math.round(data.velocity);
                speedEl.textContent = speed.toLocaleString("tr-TR");
            }

            if (data.altitude !== undefined) {
                altEl.textContent = data.altitude.toFixed(1);
            }

            if (data.visibility !== undefined) {
                // API returns "daylight" or "eclipsed"
                const isDaylight = data.visibility === "daylight" || data.visibility === true;
                visEl.textContent = isDaylight ? "☀️" : "🌙";
                visEl.title = isDaylight ? "ISS Gündüz Bölgesinde" : "ISS Gece Bölgesinde";
            }
        }
    };
}
