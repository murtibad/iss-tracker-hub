// src/utils/utils.js
// TR: Ortak yardımcı fonksiyonlar - DRY prensibi için merkezi modül
// EN: Common utility functions - Centralized module for DRY principle

/**
 * Format number with fixed decimals
 * @param {number} n - Number to format
 * @param {number} digits - Decimal places (default: 2)
 * @returns {string} Formatted number or "--" if invalid
 */
export function fmtNum(n, digits = 2) {
    if (typeof n !== "number" || Number.isNaN(n)) return "--";
    return n.toFixed(digits);
}

/**
 * Format number as integer
 * @param {number} n - Number to format
 * @returns {string} Integer string or "--" if invalid
 */
export function fmtInt(n) {
    if (typeof n !== "number" || Number.isNaN(n)) return "--";
    return String(Math.round(n));
}

/**
 * Pad number to 2 digits with leading zero
 * @param {number} n - Number to pad
 * @returns {string} Padded number string
 */
export function pad2(n) {
    const x = Math.max(0, Math.floor(n));
    return x < 10 ? `0${x}` : `${x}`;
}

/**
 * Format milliseconds to HH:MM:SS
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted time string
 */
export function fmtHMS(ms) {
    if (typeof ms !== "number" || Number.isNaN(ms)) return "--:--:--";
    const s = Math.max(0, Math.floor(ms / 1000));
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

/**
 * Clamp latitude to valid range [-85, 85]
 * @param {number} lat - Latitude value
 * @returns {number} Clamped latitude
 */
export function clampLat(lat) {
    return Math.max(-85, Math.min(85, lat));
}

/**
 * Normalize longitude to [-180, 180]
 * @param {number} lon - Longitude value
 * @returns {number} Normalized longitude
 */
export function normalizeLon(lon) {
    let x = lon;
    while (x > 180) x -= 360;
    while (x < -180) x += 360;
    return x;
}

/**
 * Safe JSON parse with fallback
 * @param {string} txt - JSON string to parse
 * @returns {Object|null} Parsed object or null on error
 */
export function safeJsonParse(txt) {
    try {
        return JSON.parse(txt);
    } catch {
        return null;
    }
}

/**
 * Safe localStorage wrapper with error handling
 */
export const safeStorage = {
    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @returns {string|null} Stored value or null
     */
    getItem: (key) => {
        try {
            return window.localStorage?.getItem(key) ?? null;
        } catch (e) {
            console.warn('[Storage] getItem failed:', e);
            return null;
        }
    },

    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {string} value - Value to store
     */
    setItem: (key, value) => {
        try {
            window.localStorage?.setItem(key, value);
        } catch (e) {
            console.warn('[Storage] setItem failed:', e);
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    removeItem: (key) => {
        try {
            window.localStorage?.removeItem(key);
        } catch (e) {
            console.warn('[Storage] removeItem failed:', e);
        }
    }
};

/**
 * Create DOM element with class and optional parent
 * @param {string} tag - HTML tag name
 * @param {string} className - CSS class name(s)
 * @param {HTMLElement} parent - Optional parent to append to
 * @returns {HTMLElement} Created element
 */
export function buildEl(tag, className, parent) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (parent) parent.appendChild(n);
    return n;
}

/**
 * Debounce function execution
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Throttle function execution
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum time between calls in ms
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit = 100) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            fn.apply(this, args);
        }
    };
}

/**
 * Format date to locale string
 * @param {Date|number} date - Date object or timestamp
 * @param {string} locale - Locale string (default: 'tr-TR')
 * @returns {string} Formatted date string
 */
export function formatDate(date, locale = 'tr-TR') {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format time to locale string
 * @param {Date|number} date - Date object or timestamp
 * @param {string} locale - Locale string (default: 'tr-TR')
 * @returns {string} Formatted time string
 */
export function formatTime(date, locale = 'tr-TR') {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
