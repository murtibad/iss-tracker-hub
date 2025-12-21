// src/ui/crewWidgetView.js
import { enhanceCrewData } from "../services/astronauts.js";

export function openCrewModal() {
  if (document.querySelector(".crew-overlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "crew-overlay";
  overlay.style.display = "flex";

  const card = document.createElement("div");
  card.className = "crew-card hub-glass";

  card.innerHTML = `
    <div class="crew-top">
      <div class="crew-title">🚀 ISS Mürettebatı</div>
      <button type="button" class="btn crew-close">✕</button>
    </div>
    <div class="crew-content">
      <div style="text-align: center; padding: 40px 20px; color: var(--muted);">
        ⏳ Yükleniyor...
      </div>
    </div>
  `;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  const closeBtn = card.querySelector(".crew-close");
  closeBtn.onclick = () => overlay.remove();
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
  card.onclick = (e) => e.stopPropagation();

  // Fetch crew and enhance with Wikipedia data
  fetch("http://api.open-notify.org/astros.json")
    .then(r => r.json())
    .then(async (d) => {
      const issCrew = d.people.filter(p => p.craft === "ISS");

      // Show basic info while loading details
      const content = card.querySelector(".crew-content");
      content.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--muted);">
          🔍 ${issCrew.length} astronotun bilgileri Wikipedia'dan alınıyor...
        </div>
      `;

      // Enhance with Wikipedia data
      const enhancedCrew = await enhanceCrewData(issCrew);

      // Render enhanced crew cards
      content.innerHTML = `
        <div class="crew-list">
          ${enhancedCrew.map(astronaut => renderAstronautCard(astronaut)).join("")}
        </div>
      `;
    })
    .catch((error) => {
      const content = card.querySelector(".crew-content");
      content.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--bad);">
          ❌ Yüklenemedi<br>
          <small style="opacity: 0.7;">${error.message}</small>
        </div>
      `;
    });
}

function renderAstronautCard(astronaut) {
  const {
    name,
    craft,
    thumbnail,
    extract,
    description,
    wikiUrl
  } = astronaut;

  return `
    <div class="crew-item-enhanced">
      ${thumbnail ? `
        <div class="crew-photo">
          <img src="${thumbnail}" alt="${name}" loading="lazy">
        </div>
      ` : `
        <div class="crew-photo crew-photo-placeholder">
          <div class="crew-photo-icon">👨‍🚀</div>
        </div>
      `}
      
      <div class="crew-details">
        <div class="crew-name-enhanced">${name}</div>
        <div class="crew-description">${description}</div>
        <div class="crew-craft-tag">
          <span class="crew-craft-icon">🛰️</span> ${craft}
        </div>
        
        <div class="crew-bio">
          ${extract || "No information available"}
        </div>
        
        ${wikiUrl ? `
          <a href="${wikiUrl}" target="_blank" rel="noopener noreferrer" class="crew-wiki-link">
            📖 Wikipedia'da Oku →
          </a>
        ` : ""}
      </div>
    </div>
  `;
}

window.openCrewModal = openCrewModal;
