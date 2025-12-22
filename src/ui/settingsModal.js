import { t, getCurrentLanguage, setLanguage } from "../i18n/i18n.js";
import { ICONS } from "./icons.js";

export function createSettingsModal(options = {}) {
  const modal = document.createElement("div");
  modal.className = "hub-modal-overlay hidden";

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' }, { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' }, { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' }, { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' }, { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'zh', label: '中文', flag: '🇨🇳' }, { code: 'pt', label: 'Português', flag: '🇵🇹' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' }, { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'bn', label: 'বাংলা', flag: '🇧🇩' }, { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' }, { code: 'pl', label: 'Polski', flag: '🇵🇱' },
    { code: 'ro', label: 'Română', flag: '🇷🇴' }, { code: 'sv', label: 'Svenska', flag: '🇸🇪' }
  ];

  // Basic structure
  modal.innerHTML = `
    <div class="hub-modal settings-modal">
      <div class="hub-modal-header">
        <div class="hub-modal-title" style="display:flex; gap:8px; align-items:center;">
            ${ICONS.settings} <span>${t('settings')}</span>
        </div>
        <button class="hub-modal-close" aria-label="${t('close')}">${ICONS.close}</button>
      </div>
      <div class="hub-modal-body">
      
        <!-- Tools Section (Location Restoration) -->
        <div class="settings-group">
            <div class="settings-label">${t('tools')} & ${t('location')}</div>
            <div class="settings-controls">
                <button class="settings-btn" id="btn-location">
                    <span style="display:flex; gap:6px; justify-content:center; align-items:center;">
                        ${ICONS.map} ${t('changeLocation')}
                    </span>
                </button>
            </div>
            <div class="settings-hint">${t('passDepend')}</div>
        </div>

        <!-- Language Section -->
        <div class="settings-group">
          <div class="settings-label">${t('language')}</div>
          <div class="settings-controls" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
            ${languages.map(l => `
                <button class="settings-btn" data-lang="${l.code}" aria-label="${l.label}" style="font-size:11px; padding:6px;">
                    ${l.flag} ${l.code.toUpperCase()}
                </button>
            `).join('')}
          </div>
        </div>

        <!-- Theme Section -->
        <div class="settings-group">
          <div class="settings-label">${t('theme')}</div>
          <div class="settings-controls" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
              <button class="settings-btn" data-theme="light" aria-label="Light theme" style="font-size:11px; padding:6px;">☀️ Light</button>
              <button class="settings-btn active" data-theme="dark" aria-label="Dark theme" style="font-size:11px; padding:6px;">🌙 Dark</button>
              <button class="settings-btn" data-theme="system" aria-label="System theme" style="font-size:11px; padding:6px;">💻 System</button>
          </div>
        </div>

        <!-- Meta Info -->
        <div class="settings-meta">
          ISS Tracker HUB v0.3.2<br>
          Restoration Build
        </div>
      </div>
    </div>
  `;

  // Internal references
  const closeBtn = modal.querySelector(".hub-modal-close");
  const langBtns = modal.querySelectorAll("[data-lang]");
  const titleEl = modal.querySelector(".hub-modal-title span");
  const langLabel = modal.querySelector(".settings-group:nth-child(2) .settings-label");
  const themeLabel = modal.querySelector(".settings-group:nth-child(3) .settings-label");
  const locBtn = modal.querySelector("#btn-location");

  // Close logic
  const close = () => {
    modal.classList.add("hidden");
    document.removeEventListener("keydown", handleEscape);
  };

  const handleEscape = (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      close();
    }
  };

  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  // Location logic
  locBtn.addEventListener("click", () => {
    close();
    if (options.onOpenLocation) options.onOpenLocation();
  });

  // Language logic
  const updateActiveLang = () => {
    const cur = getCurrentLanguage();
    langBtns.forEach(btn => {
      if (btn.dataset.lang === cur) btn.classList.add("active");
      else btn.classList.remove("active");
    });

    // Update labels inside modal immediately
    titleEl.textContent = t('settings');
    langLabel.textContent = t('language');
    themeLabel.textContent = t('theme');
  };

  langBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const code = btn.dataset.lang;
      setLanguage(code);
      updateActiveLang();
    });
  });

  // Theme logic
  const themeBtns = modal.querySelectorAll("[data-theme]");
  themeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme;
      // Use the global applyTheme logic if exposed, or manually set attribute
      // Ideally we should call a global function or emit event, 
      // but direct attribute set works if we also update storage with correct key
      document.documentElement.setAttribute("data-theme", theme === 'system' ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light') : theme);
      localStorage.setItem("issThemeMode", theme); // Correct key from boot.js

      // Update active state
      themeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  return {
    el: modal,
    open: () => {
      updateActiveLang(); // Sync language

      // Sync theme
      const currentTheme = localStorage.getItem("issThemeMode") || "system"; // Match boot.js key
      themeBtns.forEach(b => {
        if (b.dataset.theme === currentTheme) b.classList.add("active");
        else b.classList.remove("active");
      });

      document.addEventListener("keydown", handleEscape);
      modal.classList.remove("hidden");
    }
  };
}
