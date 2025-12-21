// src/ui/themePickerView.js
// Renkli cam tema seçici

const GLASS_COLORS = {
    cyan: { name: "Cyan", value: "#22d3ee", emoji: "🔵" },
    purple: { name: "Purple", value: "#a855f7", emoji: "💜" },
    pink: { name: "Pink", value: "#ec4899", emoji: "💗" },
    green: { name: "Green", value: "#10b981", emoji: "🟢" },
    amber: { name: "Amber", value: "#f59e0b", emoji: "🟡" },
    red: { name: "Red", value: "#ef4444", emoji: "🔴" },
};

const STORAGE_KEY = "isshub:glassColor";

function el(tag, className) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    return n;
}

export function getGlassColor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && /^#[0-9a-fA-F]{6}$/.test(saved)) return saved;
    return GLASS_COLORS.cyan.value; // varsayılan
}

export function setGlassColor(color) {
    localStorage.setItem(STORAGE_KEY, color);
    applyGlassColor(color);
}

export function applyGlassColor(color) {
    const root = document.documentElement;

    // HSL'e dönüştür - daha kolay manipülasyon için
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    let h = 0, s = 0;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);

    // CSS variables güncelle
    root.style.setProperty("--glass-hue", h);
    root.style.setProperty("--glass-sat", `${s}%`);
    root.style.setProperty("--accent", color);
}

export function createThemePicker() {
    // Modal overlay
    const overlay = el("div", "theme-picker-overlay");
    overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: 3000;
    display: none;
    align-items: center;
    justify-content: center;
  `;

    // Modal card
    const card = el("div", "theme-picker-card hub-glass");
    card.style.cssText = `
    width: min(400px, calc(100% - 32px));
    padding: 20px;
    border-radius: 18px;
    max-height: 80vh;
    overflow: auto;
  `;

    // Header
    const header = el("div", "theme-picker-header");
    header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  `;

    const title = el("div", "");
    title.textContent = "🎨 Cam Rengi Seç";
    title.style.cssText = `
    font-weight: 900;
    font-size: 18px;
  `;

    const closeBtn = el("button", "btn");
    closeBtn.type = "button";
    closeBtn.textContent = "✕";
    closeBtn.style.cssText = `
    width: 32px;
    height: 32px;
    padding: 0;
    font-size: 18px;
  `;

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Color grid
    const grid = el("div", "theme-color-grid");
    grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  `;

    Object.entries(GLASS_COLORS).forEach(([key, { name, value, emoji }]) => {
        const btn = el("button", "theme-color-btn");
        btn.type = "button";
        btn.style.cssText = `
      padding: 16px;
      border: 2px solid var(--ring);
      border-radius: 14px;
      background: rgba(255,255,255,0.06);
      cursor: pointer;
      transition: all 150ms;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      font-weight: 800;
      font-size: 14px;
    `;

        const emojiSpan = el("span", "");
        emojiSpan.textContent = emoji;
        emojiSpan.style.fontSize = "28px";

        const nameSpan = el("span", "");
        nameSpan.textContent = name;
        nameSpan.style.fontSize = "12px";
        nameSpan.style.opacity = "0.8";

        const colorPreview = el("div", "");
        colorPreview.style.cssText = `
      width: 100%;
      height: 4px;
      border-radius: 999px;
      background: ${value};
      margin-top: 4px;
    `;

        btn.appendChild(emojiSpan);
        btn.appendChild(nameSpan);
        btn.appendChild(colorPreview);

        btn.addEventListener("click", () => {
            setGlassColor(value);
            overlay.style.display = "none";
        });

        btn.addEventListener("mouseenter", () => {
            btn.style.transform = "translateY(-2px)";
            btn.style.borderColor = value;
        });

        btn.addEventListener("mouseleave", () => {
            btn.style.transform = "translateY(0)";
            btn.style.borderColor = "var(--ring)";
        });

        grid.appendChild(btn);
    });

    // Custom color picker
    const customSection = el("div", "");
    customSection.style.cssText = `
    border-top: 1px solid var(--ring);
    padding-top: 16px;
  `;

    const customLabel = el("div", "");
    customLabel.textContent = "⚙️ Özel Renk";
    customLabel.style.cssText = `
    font-weight: 800;
    font-size: 14px;
    margin-bottom: 8px;
  `;

    const customRow = el("div", "");
    customRow.style.cssText = `
    display: flex;
    gap: 8px;
  `;

    const colorInput = el("input", "");
    colorInput.type = "color";
    colorInput.value = getGlassColor();
    colorInput.style.cssText = `
    width: 60px;
    height: 40px;
    border: 2px solid var(--ring);
    border-radius: 12px;
    cursor: pointer;
    background: transparent;
  `;

    const applyBtn = el("button", "btn");
    applyBtn.type = "button";
    applyBtn.textContent = "Uygula";
    applyBtn.style.cssText = `
    flex: 1;
    height: 40px;
  `;

    applyBtn.addEventListener("click", () => {
        setGlassColor(colorInput.value);
        overlay.style.display = "none";
    });

    customRow.appendChild(colorInput);
    customRow.appendChild(applyBtn);
    customSection.appendChild(customLabel);
    customSection.appendChild(customRow);

    // Assemble
    card.appendChild(header);
    card.appendChild(grid);
    card.appendChild(customSection);
    overlay.appendChild(card);

    closeBtn.addEventListener("click", () => {
        overlay.style.display = "none";
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.style.display = "none";
    });

    return {
        el: overlay,
        open: () => {
            colorInput.value = getGlassColor();
            overlay.style.display = "flex";
        },
    };
}
