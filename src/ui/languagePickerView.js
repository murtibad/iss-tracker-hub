// src/ui/languagePickerView.js
// Language selection modal - Dil seçim modalı

import { getAvailableLanguages, getCurrentLanguage, setLanguage, t } from '../i18n/i18n.js';

function el(tag, className) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    return n;
}

export function createLanguagePicker() {
    // Modal overlay
    const overlay = el('div', 'language-picker-overlay');
    overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    z-index: 3000;
    display: none;
    align-items: center;
    justify-content: center;
  `;

    // Modal card
    const card = el('div', 'language-picker-card hub-glass');
    card.style.cssText = `
    width: min(500px, calc(100% - 32px));
    padding: 24px;
    border-radius: 16px;
    max-height: 80vh;
    overflow: auto;
  `;

    // Header
    const header = el('div', 'language-picker-header');
    header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  `;

    const title = el('div', '');
    title.textContent = `🌍 ${t('language')}`;
    title.style.cssText = `
    font-weight: 900;
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-shadow: var(--text-glow);
  `;

    const closeBtn = el('button', 'btn');
    closeBtn.type = 'button';
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
    width: 36px;
    height: 36px;
    padding: 0;
    font-size: 20px;
  `;

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Language grid
    const grid = el('div', 'language-grid');
    grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  `;

    const languages = getAvailableLanguages();
    const currentLang = getCurrentLanguage();

    languages.forEach(({ code, name, flag }) => {
        const btn = el('button', 'language-btn');
        const isActive = code === currentLang;

        btn.type = 'button';
        btn.style.cssText = `
      padding: 16px 12px;
      border: 2px solid ${isActive ? 'var(--accent)' : 'var(--ring)'};
      border-radius: 12px;
      background: ${isActive ? 'rgba(255, 20, 147, 0.1)' : 'rgba(255,255,255,0.02)'};
      cursor: pointer;
      transition: all 200ms;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      font-weight: ${isActive ? '900' : '700'};
      font-size: 14px;
      box-shadow: ${isActive ? '0 0 15px hsla(var(--glass-hue), var(--glass-sat), 50%, 0.3)' : 'none'};
    `;

        const flagSpan = el('span', '');
        flagSpan.textContent = flag;
        flagSpan.style.fontSize = '32px';

        const nameSpan = el('span', '');
        nameSpan.textContent = name;
        nameSpan.style.fontSize = '12px';
        nameSpan.style.color = isActive ? 'var(--accent)' : 'var(--text)';

        btn.appendChild(flagSpan);
        btn.appendChild(nameSpan);

        btn.addEventListener('click', () => {
            setLanguage(code);
            overlay.style.display = 'none';

            // Reload page to apply new language
            window.location.reload();
        });

        btn.addEventListener('mouseenter', () => {
            if (!isActive) {
                btn.style.borderColor = 'var(--accent)';
                btn.style.transform = 'translateY(-2px)';
            }
        });

        btn.addEventListener('mouseleave', () => {
            if (!isActive) {
                btn.style.borderColor = 'var(--ring)';
                btn.style.transform = 'translateY(0)';
            }
        });

        grid.appendChild(btn);
    });

    // Info text
    const info = el('div', '');
    info.style.cssText = `
    margin-top: 16px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
    font-size: 12px;
    color: var(--muted);
    line-height: 1.5;
  `;
    info.innerHTML = `
    <div style="margin-bottom: 6px;">
      🌐 Language detected from your IP address
    </div>
    <div>
      💾 Your preference is saved locally
    </div>
  `;

    // Assemble
    card.appendChild(header);
    card.appendChild(grid);
    card.appendChild(info);
    overlay.appendChild(card);

    closeBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.style.display = 'none';
    });

    return {
        el: overlay,
        open: () => {
            overlay.style.display = 'flex';
        },
    };
}
