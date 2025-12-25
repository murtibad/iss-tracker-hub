// src/ui/components/networkStatusBar.js
// Offline/Stale data status indicator

import { t } from "../../i18n/i18n.js";

export function createNetworkStatusBar() {
    const bar = document.createElement("div");
    bar.className = "network-status-bar";
    bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(239, 68, 68, 0.95);
    color: white;
    padding: 8px 16px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    z-index: 9999;
    display: none;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  `.trim();

    const text = document.createElement("span");
    bar.appendChild(text);

    let isOnline = navigator.onLine;
    let lastDataTimestamp = Date.now();
    const STALE_THRESHOLD_MS = 30000; // 30 seconds

    function update() {
        const now = Date.now();
        const dataAge = now - lastDataTimestamp;
        const isStale = dataAge > STALE_THRESHOLD_MS;

        if (!isOnline) {
            bar.style.background = "rgba(239, 68, 68, 0.95)"; // red
            text.textContent = "🔴 " + t('offline');
            bar.style.display = "block";
        } else {
            bar.style.display = "none";
        }
    }

    // Network event listeners
    window.addEventListener('online', () => {
        isOnline = true;
        console.log('[Network] Online');
        update();
    });

    window.addEventListener('offline', () => {
        isOnline = false;
        console.log('[Network] Offline');
        update();
    });

    // Check staleness periodically
    setInterval(update, 5000);

    // Public API
    return {
        el: bar,
        markDataReceived: () => {
            lastDataTimestamp = Date.now();
            update();
        },
        update
    };
}
