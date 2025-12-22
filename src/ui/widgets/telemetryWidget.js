// src/ui/widgets/telemetryWidget.js
// Sol panel - Telemetri bilgileri widget'ı

export function createTelemetryWidget() {
    const container = document.createElement("div");
    container.className = "telemetry-widget hub-glass";
    container.style.cssText = `
    padding: 16px;
    margin-bottom: 12px;
  `;

    container.innerHTML = `
    <div class="telemetry-header" style="
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--ring);
    ">
      <span style="font-size: 20px;">📡</span>
      <h3 style="
        margin: 0;
        font-size: 14px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-shadow: var(--text-glow);
      ">Telemetri</h3>
    </div>

    <div class="telemetry-data">
      <div class="telemetry-item" data-key="altitude">
        <span class="telemetry-icon">⬆️</span>
        <span class="telemetry-label">İrtifa</span>
        <span class="telemetry-value" data-value="altitude">--- km</span>
      </div>

      <div class="telemetry-item" data-key="speed">
        <span class="telemetry-icon">⚡</span>
        <span class="telemetry-label">Hız</span>
        <span class="telemetry-value" data-value="speed">--- km/h</span>
      </div>

      <div class="telemetry-item" data-key="latitude">
        <span class="telemetry-icon">🧭</span>
        <span class="telemetry-label">Enlem</span>
        <span class="telemetry-value" data-value="latitude">---</span>
      </div>

      <div class="telemetry-item" data-key="longitude">
        <span class="telemetry-icon">🌍</span>
        <span class="telemetry-label">Boylam</span>
        <span class="telemetry-value" data-value="longitude">---</span>
      </div>

      <div class="telemetry-item" data-key="footprint">
        <span class="telemetry-icon">📍</span>
        <span class="telemetry-label">Yüzey Durumu</span>
        <span class="telemetry-value" data-value="footprint">---</span>
      </div>
    </div>

    <div class="telemetry-progress" style="
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px solid var(--ring);
    ">
      <div class="progress-label" style="
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        color: var(--muted);
        margin-bottom: 6px;
      ">Yörünge İlerlemesi</div>
      <div class="progress-bar-container" style="
        height: 6px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 999px;
        overflow: hidden;
        position: relative;
      ">
        <div class="progress-bar-fill" data-progress="bar" style="
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, var(--accent), var(--accent2));
          border-radius: 999px;
          transition: width 300ms ease;
          box-shadow: 0 0 10px var(--accent);
        "></div>
      </div>
      <div class="progress-percentage" data-progress="text" style="
        font-size: 10px;
        color: var(--muted);
        margin-top: 4px;
        text-align: right;
      ">0%</div>
    </div>
  `;

    // Add telemetry item styles
    const style = document.createElement("style");
    style.textContent = `
    .telemetry-item {
      display: grid;
      grid-template-columns: 24px 1fr auto;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .telemetry-item:last-child {
      border-bottom: none;
    }

    .telemetry-icon {
      font-size: 16px;
      text-align: center;
    }

    .telemetry-label {
      font-size: 12px;
      color: var(--muted);
      font-weight: 600;
    }

    .telemetry-value {
      font-size: 13px;
      font-weight: 800;
      color: var(--accent);
      font-family: 'Courier New', monospace;
      text-shadow: var(--text-glow);
      text-align: right;
    }
  `;
    document.head.appendChild(style);

    return {
        el: container,
        update: (data) => {
            // Update altitude
            const altElement = container.querySelector('[data-value="altitude"]');
            if (altElement && data.altitude) {
                altElement.textContent = `${data.altitude.toFixed(1)} km`;
            }

            // Update speed
            const speedElement = container.querySelector('[data-value="speed"]');
            if (speedElement && data.velocity) {
                speedElement.textContent = `${Math.round(data.velocity)} km/h`;
            }

            // Update latitude
            const latElement = container.querySelector('[data-value="latitude"]');
            if (latElement && data.latitude !== undefined) {
                latElement.textContent = `${data.latitude.toFixed(4)}°`;
            }

            // Update longitude
            const lonElement = container.querySelector('[data-value="longitude"]');
            if (lonElement && data.longitude !== undefined) {
                lonElement.textContent = `${data.longitude.toFixed(4)}°`;
            }

            // Update footprint (ocean/land)
            const footprintElement = container.querySelector('[data-value="footprint"]');
            if (footprintElement && data.footprint) {
                footprintElement.textContent = data.footprint;
            }

            // Update progress bar (based on time or position)
            if (data.progress !== undefined) {
                const progressBar = container.querySelector('[data-progress="bar"]');
                const progressText = container.querySelector('[data-progress="text"]');

                if (progressBar) {
                    progressBar.style.width = `${data.progress}%`;
                }
                if (progressText) {
                    progressText.textContent = `${Math.round(data.progress)}%`;
                }
            }
        }
    };
}
