// src/ui/widgets/timeSystemWidget.js
// Zaman sistemi widget'ı - UTC, Local, Uptime

export function createTimeSystemWidget() {
    const container = document.createElement("div");
    container.className = "time-system-widget hub-glass";
    container.style.cssText = `
    padding: 16px;
    margin-bottom: 12px;
  `;

    container.innerHTML = `
    <div class="time-header" style="
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--ring);
    ">
      <span style="font-size: 20px;">⏰</span>
      <h3 style="
        margin: 0;
        font-size: 14px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-shadow: var(--text-glow);
      ">Zaman Sistemi</h3>
    </div>

    <div class="time-data">
      <div class="time-item">
        <span class="time-label">UTC Saati</span>
        <span class="time-value" data-value="utc">--:--:--</span>
      </div>

      <div class="time-item">
        <span class="time-label">Yerel Saat</span>
        <span class="time-value" data-value="local">--:--:--</span>
      </div>

      <div class="time-item">
        <span class="time-label">Artırım Süresi</span>
        <span class="time-value" data-value="uptime">00:00:00</span>
      </div>
    </div>
  `;

    // Styles
    const style = document.createElement("style");
    style.textContent = `
    .time-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .time-item:last-child {
      border-bottom: none;
    }

    .time-label {
      font-size: 12px;
      color: var(--muted);
      font-weight: 600;
    }

    .time-value {
      font-size: 14px;
      font-weight: 800;
      color: var(--accent);
      font-family: 'Courier New', monospace;
      text-shadow: var(--text-glow);
    }
  `;
    document.head.appendChild(style);

    // Update time every second
    const startTime = Date.now();

    const updateTime = () => {
        const now = new Date();

        // UTC time
        const utcElement = container.querySelector('[data-value="utc"]');
        if (utcElement) {
            utcElement.textContent = now.toUTCString().split(' ')[4];
        }

        // Local time
        const localElement = container.querySelector('[data-value="local"]');
        if (localElement) {
            localElement.textContent = now.toLocaleTimeString('tr-TR');
        }

        // Uptime
        const uptimeElement = container.querySelector('[data-value="uptime"]');
        if (uptimeElement) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
            const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            uptimeElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    };

    // Initial update and set interval
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return {
        el: container,
        destroy: () => clearInterval(interval)
    };
}
