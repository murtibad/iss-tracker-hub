import { t, getCurrentLanguage, setLanguage } from "../i18n/i18n.js";
import { themeManager } from "../services/themeManager.js";
import { ICONS } from "./icons.js";
import { setTheme, setColorPalette, setLanguage as saveLanguagePref } from "../services/userPreferences.js";
import { CONFIG } from "../constants/config.js";

export function createSettingsModal(options = {}) {
  const modal = document.createElement("div");
  modal.className = "hub-modal-overlay hidden";

  // Available languages (fully translated)
  const AVAILABLE_LANGS = ['tr', 'en'];

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
            ${languages.map(l => {
    const isAvailable = AVAILABLE_LANGS.includes(l.code);
    const lockIcon = isAvailable ? '' : '🔒';
    const disabledStyle = isAvailable ? '' : 'opacity: 0.5; cursor: not-allowed;';
    const title = isAvailable ? l.label : (getCurrentLanguage() === 'tr' ? 'Yakında gelecek' : 'Coming soon');
    return `
                <button class="settings-btn ${isAvailable ? '' : 'locked'}" 
                        data-lang="${l.code}" 
                        aria-label="${l.label}" 
                        title="${title}"
                        ${isAvailable ? '' : 'disabled'}
                        style="font-size:11px; padding:6px; ${disabledStyle}">
                    ${l.flag} ${l.code.toUpperCase()} ${lockIcon}
                </button>
              `;
  }).join('')}
          </div>
          <div class="settings-hint" style="font-size:10px; opacity:0.6; margin-top:6px;">
            🔒 = ${t('comingSoon')}
          </div>
        </div>

        <!-- Theme Section -->
        <div class="settings-group">
          <div class="settings-label">${t('theme')}</div>
          <div class="settings-controls" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
              <button class="settings-btn" data-theme="light" aria-label="${t('themeLight')}" style="font-size:11px; padding:6px;">☀️ ${t('themeLight')}</button>
              <button class="settings-btn active" data-theme="dark" aria-label="${t('themeDark')}" style="font-size:11px; padding:6px;">🌙 ${t('themeDark')}</button>
              <button class="settings-btn" data-theme="system" aria-label="${t('themeSystem')}" style="font-size:11px; padding:6px;">💻 ${t('themeSystem')}</button>
          </div>
        </div>

        <!-- Accent Color Section -->
        <div class="settings-group">
            <div class="settings-label">${t('color')}</div>
            <div class="settings-controls" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;">
                <button class="settings-btn color-btn" data-color="cyan" style="background:#00f3ff; height:24px; border-radius:4px;"></button>
                <button class="settings-btn color-btn" data-color="pink" style="background:#ff00ff; height:24px; border-radius:4px;"></button>
                <button class="settings-btn color-btn" data-color="green" style="background:#0aff00; height:24px; border-radius:4px;"></button>
                <button class="settings-btn color-btn" data-color="orange" style="background:#ffaa00; height:24px; border-radius:4px;"></button>
                <button class="settings-btn color-btn" data-color="purple" style="background:#bd00ff; height:24px; border-radius:4px;"></button>
            </div>
        </div>

        <!-- Meta Info -->
        <div class="settings-meta">
          ISS Tracker HUB ${CONFIG.VERSION}<br>
          <span style="opacity:0.6; font-size:10px;">${CONFIG.VERSION_CODENAME || 'Orbital'} Edition</span>
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
  // Get initial theme from localStorage or system
  const savedTheme = localStorage.getItem("issThemeMode") || 'system';
  themeBtns.forEach(btn => {
    if (btn.dataset.theme === savedTheme) btn.classList.add("active");

    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme;
      // If system, check preference, otherwise use selected theme
      const effTheme = theme === 'system' ?
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light') :
        theme;

      // Use ThemeManager to handle state and notification
      themeManager.setMode(theme);

      // Legacy/External support (Globe etc)
      document.documentElement.setAttribute("data-theme", effTheme);
      localStorage.setItem("issThemeMode", theme);

      // Dispatch event for Globe
      window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: {
          theme: effTheme,
          type: 'mode'
        }
      }));

      themeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Color logic
  const colorBtns = modal.querySelectorAll("[data-color]");
  const colorMap = {
    cyan: '#00f3ff',
    pink: '#ff00ff',
    green: '#0aff00',
    orange: '#ffaa00',
    purple: '#bd00ff'
  };

  colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const colorName = btn.dataset.color;
      const colorHex = colorMap[colorName];

      // Update CSS variables
      const root = document.documentElement;
      root.style.setProperty('--accent', colorHex);
      root.style.setProperty('--neon-cyan', colorHex); // Override main neon color
      root.style.setProperty('--border', `rgba(${hexToRgb(colorHex)}, 0.3)`);

      // Update ThemeManager
      themeManager.setPalette(colorName.toUpperCase());

      localStorage.setItem("issAccentColor", colorName);
      setColorPalette(colorName.toUpperCase()); // Sync to cloud

      // Visual feedback
      colorBtns.forEach(b => b.style.outline = 'none');
      btn.style.outline = '2px solid #fff';

      // Dispatch themeChanged event for Globe trajectory colors - IMMEDIATE UPDATE
      window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: {
          color: colorHex,
          type: 'accent'
        }
      }));
    });
  });

  // Helper
  function hexToRgb(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }

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
