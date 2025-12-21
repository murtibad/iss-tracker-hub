// src/ui/terminalView.js
export function createTerminal() {
  const t = document.createElement("div");
  t.className = "hub-terminal glass";
  t.style.left = "12px";
  t.style.bottom = "12px";

  t.innerHTML = `
    <div class="term-head">
      <strong>TERMINAL</strong>
      <button class="term-min">–</button>
    </div>
    <div class="term-body"></div>
    <input class="term-input" placeholder="komut gir..." />
  `;

  const head = t.querySelector(".term-head");
  const body = t.querySelector(".term-body");
  const input = t.querySelector(".term-input");
  const minBtn = t.querySelector(".term-min");

  let dx = 0, dy = 0;

  head.onmousedown = e => {
    dx = e.clientX - t.offsetLeft;
    dy = e.clientY - t.offsetTop;
    document.onmousemove = e2 => {
      t.style.left = e2.clientX - dx + "px";
      t.style.top = e2.clientY - dy + "px";
      t.style.bottom = "auto";
    };
    document.onmouseup = () => (document.onmousemove = null);
  };

  minBtn.onclick = () => t.classList.toggle("min");

  function log(msg) {
    body.innerHTML += `<div>${msg}</div>`;
    body.scrollTop = body.scrollHeight;
  }

  input.onkeydown = e => {
    if (e.key !== "Enter") return;
    const cmd = input.value.trim();
    input.value = "";
    log(`> ${cmd}`);

    if (cmd === "clear") body.innerHTML = "";
    if (cmd === "crew") window.openCrewModal?.();
    if (cmd === "track") window.startFollow?.();
    if (cmd === "home") window.stopFollow?.();
  };

  return t;
}
