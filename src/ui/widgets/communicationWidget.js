// src/ui/widgets/communicationWidget.js
// İletişim durumu widget'ı

export function createCommunicationWidget() {
    const container = document.createElement("div");
    container.className = "communication-widget hub-glass";
    container.style.cssText = `
    padding: 16px;
    margin-bottom: 12px;
  `;

    container.innerHTML = `
    <div class="communication-header" style="
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
      ">İletişim</h3>
    </div>

    <div class="communication-status">
      <div class="status-indicator" style="
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background: rgba(var(--accent), 0.1);
        border-radius: 10px;
        border: 1px solid var(--ring);
      ">
        <div class="signal-pulse" style="
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--good);
          box-shadow: 0 0 8px var(--good);
          animation: pulse 2s infinite;
        "></div>
        <span style="
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
        ">Sinyal Durumu</span>
        <span style="
          margin-left: auto;
          font-size: 12px;
          font-weight: 800;
          color: var(--good);
          font-family: 'Courier New', monospace;
        " data-status="signal">ACTIVE</span>
      </div>
    </div>

    <div class="communication-note" style="
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid var(--ring);
      font-size: 10px;
      color: var(--muted);
      line-height: 1.4;
    ">
      ISS yer istasyonları ve TDRSS uyduları ile iletişim kurar
    </div>
  `;

    // Add pulse animation
    const style = document.createElement("style");
    style.textContent = `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.6;
        transform: scale(1.2);
      }
    }
  `;
    document.head.appendChild(style);

    return {
        el: container,
        update: (data) => {
            // Can update signal status if we have data
        }
    };
}
