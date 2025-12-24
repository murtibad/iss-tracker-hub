// src/ui/crewWidgetView.js
import { createCrewBoard } from "./components/crewBoard.js";
import { t } from "../i18n/i18n.js";

export function openCrewModal() {
  if (document.querySelector(".crew-overlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "crew-overlay";
  overlay.style.display = "flex";
  // Accessible overlay styles
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
    z-index: 9999; display: flex; align-items: center; justify-content: center;
    padding: 20px;
  `;

  const card = document.createElement("div");
  card.className = "crew-modal hub-glass";
  card.style.cssText = `
    width: 100%; max-width: 800px; max-height: 90vh;
    border-radius: 16px; background: var(--panel);
    border: 1px solid var(--border); display: flex; flex-direction: column;
    box-shadow: 0 0 50px rgba(0,0,0,0.5); overflow: hidden;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 16px 24px; border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
    background: rgba(255,255,255,0.02);
  `;

  header.innerHTML = `
    <div style="font-size: 24px; font-weight: 800; color: var(--accent);">
      🚀 ${t('crewParams')?.title || "Expedition Crew"}
    </div>
    <button type="button" class="btn crew-close" style="font-size: 24px; background: transparent; border: none; color: var(--muted); cursor: pointer; min-width: 44px;">✕</button>
  `;
  card.appendChild(header);

  // Content (Scrollable)
  const content = document.createElement('div');
  content.className = "crew-content";
  content.style.cssText = `
    flex: 1; overflow-y: auto; padding: 24px;
    display: flex; flex-direction: column; align-items: center;
  `;

  // Inject Static Crew Board
  const board = createCrewBoard();
  content.appendChild(board.el);
  card.appendChild(content);

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Close Logic
  const closeBtn = header.querySelector(".crew-close");
  const close = () => overlay.remove();

  closeBtn.onclick = close;
  overlay.onclick = (e) => {
    if (e.target === overlay) close();
  };
}

window.openCrewModal = openCrewModal;
