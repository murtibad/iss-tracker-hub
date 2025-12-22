// src/ui/widgets/solarArrayWidget.js
// Solar Array enerji widget'ı

export function createSolarArrayWidget() {
    const container = document.createElement("div");
    container.className = "solar-array-widget hub-glass";
    container.style.cssText = `
    padding: 16px;
    margin-bottom: 12px;
  `;

    container.innerHTML = `
    <div class="solar-header" style="
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--ring);
    ">
      <span style="font-size: 20px;">☀️</span>
      <h3 style="
        margin: 0;
        font-size: 14px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-shadow: var(--text-glow);
      ">Solar Array</h3>
    </div>

    <div class="solar-data">
      <div class="power-display" style="
        text-align: center;
        padding: 16px;
        background: rgba(255, 215, 0, 0.05);
        border-radius: 12px;
        border: 1px solid var(--ring);
        margin-bottom: 12px;
      ">
        <div style="
          font-size: 11px;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        ">Enerji Üretimi</div>
        <div style="
          font-size: 28px;
          font-weight: 900;
          color: var(--accent);
          font-family: 'Courier New', monospace;
          text-shadow: var(--text-glow);
        " data-value="power">120 kW</div>
      </div>

      <div class="solar-info" style="
        font-size: 10px;
        color: var(--muted);
        line-height: 1.5;
        padding: 10px;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 8px;
      ">
        <div style="margin-bottom: 6px;">
          <span style="color: var(--accent); font-weight: 700;">💡</span>
          ISS 8 adet solar panel ile ~120-160 kW güç üretir
        </div>
        <div>
          <span style="color: var(--accent); font-weight: 700;">🔋</span>
          Panel alanı: ~2500 m² (yarım futbol sahası)
        </div>
      </div>
    </div>
  `;

    return {
        el: container,
        update: (data) => {
            // Can update power if we have real data
            // For now it's static at ~120kW
        }
    };
}
