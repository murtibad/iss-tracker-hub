// src/ui/crewWidgetView.js
export function openCrewModal() {
  if (document.querySelector(".crew-back")) return;

  const back = document.createElement("div");
  back.className = "crew-back";
  const box = document.createElement("div");
  box.className = "crew-box glass";

  box.innerHTML = `<h3>ISS Mürettebatı</h3><div>Yükleniyor...</div>`;
  back.appendChild(box);
  document.body.appendChild(back);

  back.onclick = () => back.remove();
  box.onclick = e => e.stopPropagation();

  fetch("http://api.open-notify.org/astros.json")
    .then(r => r.json())
    .then(d => {
      const iss = d.people.filter(p => p.craft === "ISS");
      box.innerHTML =
        `<h3>ISS Mürettebatı (${iss.length})</h3>` +
        iss.map(p => `<div>${p.name}</div>`).join("");
    })
    .catch(() => {
      box.innerHTML = "<h3>Yüklenemedi</h3>";
    });
}

window.openCrewModal = openCrewModal;
