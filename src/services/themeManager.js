// src/services/themeManager.js
// Cyberpunk Theme Manager - Handles theme modes and color palettes

const THEME_MODES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
};

const COLOR_PALETTES = {
    CYAN: {
        name: 'Neon Cyan',
        accent: '#00f3ff',
        accentSecondary: '#00b4d8',
        glow: 'rgba(0, 243, 255, 0.5)'
    },
    PINK: {
        name: 'Neon Pink',
        accent: '#ff00ff',
        accentSecondary: '#ff69b4',
        glow: 'rgba(255, 0, 255, 0.5)'
    },
    GREEN: {
        name: 'Matrix Green',
        accent: '#0aff00',
        accentSecondary: '#00cc00',
        glow: 'rgba(10, 255, 0, 0.5)'
    },
    PURPLE: {
        name: 'Cyber Purple',
        accent: '#bd00ff',
        accentSecondary: '#9933ff',
        glow: 'rgba(189, 0, 255, 0.5)'
    },
    ORANGE: {
        name: 'Sunset Orange',
        accent: '#ff6b00',
        accentSecondary: '#ff9500',
        glow: 'rgba(255, 107, 0, 0.5)'
    }
};

class ThemeManager {
    constructor() {
        this.currentMode = THEME_MODES.DARK;
        this.currentPalette = 'CYAN';
        this.listeners = [];
    }

    init() {
        // Load saved preferences
        const savedMode = localStorage.getItem('iss-theme-mode');
        const savedPalette = localStorage.getItem('iss-color-palette');

        if (savedMode && Object.values(THEME_MODES).includes(savedMode)) {
            this.currentMode = savedMode;
        }

        if (savedPalette && COLOR_PALETTES[savedPalette]) {
            this.currentPalette = savedPalette;
        }

        // Apply initial theme
        this.applyTheme();
        this.applyPalette();

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (this.currentMode === THEME_MODES.SYSTEM) {
                    this.applyTheme();
                }
            });
        }

        console.log('[ThemeManager] Initialized:', this.currentMode, this.currentPalette);
    }

    setMode(mode) {
        if (!Object.values(THEME_MODES).includes(mode)) return;

        this.currentMode = mode;
        localStorage.setItem('iss-theme-mode', mode);
        this.applyTheme();
        this.notifyListeners();
    }

    setPalette(paletteKey) {
        if (!COLOR_PALETTES[paletteKey]) return;

        this.currentPalette = paletteKey;
        localStorage.setItem('iss-color-palette', paletteKey);
        this.applyPalette();
        this.notifyListeners();
    }

    getEffectiveTheme() {
        if (this.currentMode === THEME_MODES.SYSTEM) {
            return window.matchMedia?.('(prefers-color-scheme: dark)').matches
                ? THEME_MODES.DARK
                : THEME_MODES.LIGHT;
        }
        return this.currentMode;
    }

    applyTheme() {
        const effectiveTheme = this.getEffectiveTheme();
        document.documentElement.setAttribute('data-theme', effectiveTheme);

        // Add transition class for smooth change
        document.body.classList.add('theme-transitioning');
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);
    }

    applyPalette() {
        const palette = COLOR_PALETTES[this.currentPalette];
        if (!palette) return;

        const root = document.documentElement;
        root.style.setProperty('--accent', palette.accent);
        root.style.setProperty('--accent-secondary', palette.accentSecondary);
        root.style.setProperty('--neon-glow', palette.glow);
        root.style.setProperty('--border', `${palette.accent}40`); // 25% opacity
        root.style.setProperty('--ring', `${palette.accent}26`); // 15% opacity
    }

    onThemeChange(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    notifyListeners() {
        this.listeners.forEach(l => l({
            mode: this.currentMode,
            effectiveTheme: this.getEffectiveTheme(),
            palette: this.currentPalette,
            paletteData: COLOR_PALETTES[this.currentPalette]
        }));
    }

    getAvailablePalettes() {
        return Object.entries(COLOR_PALETTES).map(([key, data]) => ({
            key,
            ...data
        }));
    }

    getAvailableModes() {
        return Object.values(THEME_MODES);
    }

    getCurrentTheme() {
        return {
            mode: this.currentMode,
            effectiveTheme: this.getEffectiveTheme(),
            palette: this.currentPalette,
            paletteData: COLOR_PALETTES[this.currentPalette]
        };
    }
}

// Singleton instance
const themeManager = new ThemeManager();

export { themeManager, THEME_MODES, COLOR_PALETTES };
export default themeManager;
