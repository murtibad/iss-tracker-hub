// src/ui/crewWidgetView.js
export function openCrewModal() {
  if (document.querySelector(".crew-overlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "crew-overlay";
  overlay.style.display = "flex";

  const card = document.createElement("div");
  card.className = "crew-card hub-glass";

  card.innerHTML = `
    <div class="crew-top">
      <div class="crew-title">ISS Mürettebatı</div>
      <button type="button" class="btn crew-close">✕</button>
    </div>
    <div class="crew-content">Yükleniyor...</div>
  `;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  const closeBtn = card.querySelector(".crew-close");
  closeBtn.onclick = () => overlay.remove();
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
  card.onclick = (e) => e.stopPropagation();

  fetch("http://api.open-notify.org/astros.json")
    .then(r => r.json())
    .then(d => {
      const iss = d.people.filter(p => p.craft === "ISS");
      const content = card.querySelector(".crew-content");
      content.innerHTML = `
        <div class="crew-list">
          ${iss.map(p => `
            <div class="crew-item">
              <div class="crew-name">${p.name}</div>
              <div class="crew-craft">${p.craft}</div>
            </div>
          `).join("")}
        </div>
      `;
    })
    .catch(() => {
      const content = card.querySelector(".crew-content");
      content.innerHTML = "❌ Yüklenemedi";
    });
}

window.openCrewModal = openCrewModal;
