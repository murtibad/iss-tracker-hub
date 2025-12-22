import { t } from "../../i18n/i18n.js";
import { ICONS } from "../icons.js";

export function createHelpCard() {
    const card = document.createElement('div');
    card.className = 'help-card hub-glass';
    card.style.cssText = `
        padding: 20px;
        border-radius: 16px;
        border: 1px solid var(--border);
        margin-top: 16px;
        background: rgba(0,0,0,0.8);
    `;

    const title = document.createElement('h3');
    title.textContent = t('helpTitle');
    title.style.cssText = `
        margin: 0 0 16px 0;
        font-family: 'Orbitron', sans-serif;
        color: var(--accent);
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    title.innerHTML = `${ICONS.settings} ${t('helpTitle')}`; // Reusing settings icon as generic gear/help

    const content = document.createElement('div');
    content.style.cssText = "font-size: 13px; line-height: 1.6; opacity: 0.9;";

    // Simple guide HTML
    content.innerHTML = `
        <p><strong>🛰️ Live Tracking:</strong> The map updates in real-time. Use the toggle button to switch between 2D Map and 3D Globe views.</p>
        <p><strong>🔴 NASA Live:</strong> Watch live HD views of Earth. If signal is lost (black screen/blue screen), switch to an alternative camera using the tabs below the player.</p>
        <p><strong>📍 Passes:</strong> Set your location in Settings to calculate when the ISS will fly over your roof. The "Next Pass" card will appear with a countdown.</p>
        <p><strong>👀 Visibility:</strong> The station looks like a bright moving star. It is only visible shortly after sunset or before sunrise.</p>
    `;

    card.append(title, content);
    return { el: card };
}
