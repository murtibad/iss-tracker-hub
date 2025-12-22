// src/ui/widgets/distancesWidget.js
// Mesafeler widget'ı - Güneş, Ay, Dünya uzaklıkları

export function createDistancesWidget() {
    const container = document.createElement("div");
    container.className = "distances-widget hub-glass";
    container.style.cssText = `
    padding: 16px;
    margin-bottom: 12px;
  `;

    container.innerHTML = `
    <div class="distances-header" style="
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--ring);
    ">
      <span style="font-size: 20px;">📏</span>
      <h3 style="
        margin: 0;
        font-size: 14px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-shadow: var(--text-glow);
      ">Mesafeler</h3>
    </div>

    <div class="distances-data">
      <div class="distance-item">
        <span class="distance-icon">☀️</span>
        <span class="distance-label">Güneş'ten Uzaklık</span>
        <span class="distance-value" data-value="sun">~149M km</span>
      </div>

      <div class="distance-item">
        <span class="distance-icon">🌍</span>
        <span class="distance-label">Dünya'ya mesafe</span>
        <span class="distance-value" data-value="earth">~420 km</span>
      </div>

      <div class="distance-item">
        <span class="distance-icon">🌙</span>
        <span class="distance-label">Ay'a Uzaklık</span>
        <span class="distance-value" data-value="moon">~384K km</span>
      </div>
    </div>

    <div class="distance-note" style="
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid var(--ring);
      font-size: 10px;
      color: var(--muted);
      line-height: 1.4;
    ">
      ISS yörüngesi konuma göre değişir ama yaklaşık 420 km yükseklikte seyreder
    </div>
  `;

    // Styles
    const style = document.createElement("style");
    style.textContent = `
    .distance-item {
      display: grid;
      grid-template-columns: 24px 1fr auto;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .distance-item:last-child {
      border-bottom: none;
    }

    .distance-icon {
      font-size: 16px;
      text-align: center;
    }

    .distance-label {
      font-size: 12px;
      color: var(--muted);
      font-weight: 600;
    }

    .distance-value {
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
            // Update values if needed
            if (data.altitude) {
                const earthElement = container.querySelector('[data-value="earth"]');
                if (earthElement) {
                    earthElement.textContent = `~${Math.round(data.altitude)} km`;
                }
            }
        }
    };
}
