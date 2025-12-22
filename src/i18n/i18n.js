// src/i18n/i18n.js
// Internationalization system - Çok dilli destek sistemi

import { LANGUAGES, COUNTRY_TO_LANGUAGE } from './languages.js';

const STORAGE_KEY = 'isshub:language';

// Current language state
let currentLanguage = 'tr'; // default

/**
 * Get language from IP geolocation
 * Uses free IP geolocation API
 */
export async function detectLanguageFromIP() {
    try {
        // Use free IP geolocation service
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        const countryCode = data.country_code; // e.g. "TR", "US", "ES"

        // Map country to language
        const detectedLang = COUNTRY_TO_LANGUAGE[countryCode] || 'en';

        console.log(`[i18n] IP detection: ${countryCode} → ${detectedLang}`);
        return detectedLang;
    } catch (error) {
        console.warn('[i18n] IP detection failed, using default:', error);
        return 'en'; // fallback to English
    }
}

/**
 * Initialize i18n system
 * - Check localStorage for saved language
 * - If no saved language, detect from IP
 * - Apply language
 */
export async function initI18n() {
    // Check localStorage
    const savedLang = localStorage.getItem(STORAGE_KEY);

    if (savedLang && LANGUAGES[savedLang]) {
        console.log(`[i18n] Using saved language: ${savedLang}`);
        currentLanguage = savedLang;
    } else {
        // Detect from IP
        const detectedLang = await detectLanguageFromIP();
        currentLanguage = detectedLang;
        localStorage.setItem(STORAGE_KEY, detectedLang);
    }

    applyLanguage(currentLanguage);
    return currentLanguage;
}

/**
 * Set language manually
 */
export function setLanguage(langCode) {
    if (!LANGUAGES[langCode]) {
        console.warn(`[i18n] Unknown language: ${langCode}`);
        return;
    }

    currentLanguage = langCode;
    localStorage.setItem(STORAGE_KEY, langCode);
    applyLanguage(langCode);

    // Trigger custom event for UI updates
    window.dispatchEvent(new CustomEvent('languagechange', {
        detail: { language: langCode }
    }));
}

/**
 * Get current language
 */
export function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Get unit system for current language
 * Returns 'metric' or 'imperial'
 */
export function getUnitSystem() {
    // US and UK use imperial (mph, miles, etc.)
    if (currentLanguage === 'en') {
        // Check if it's specifically US/UK via country detection
        // For simplicity, default to metric for English, but could be enhanced
        return 'metric'; // Most English speakers globally use metric
    }

    // All other languages use metric
    return 'metric';
}

/**
 * Get speed unit label
 */
export function getSpeedUnit() {
    return getUnitSystem() === 'imperial' ? 'mph' : 'km/h';
}

/**
 * Get distance unit label  
 */
export function getDistanceUnit() {
    return getUnitSystem() === 'imperial' ? 'mi' : 'km';
}

/**
 * Convert km/h to appropriate unit
 */
export function formatSpeed(kmh) {
    if (!Number.isFinite(kmh)) return '--';

    if (getUnitSystem() === 'imperial') {
        const mph = kmh * 0.621371;
        return Math.round(mph);
    }

    return Math.round(kmh);
}

/**
 * Convert km to appropriate unit
 */
export function formatDistance(km) {
    if (!Number.isFinite(km)) return '--';

    if (getUnitSystem() === 'imperial') {
        const miles = km * 0.621371;
        return miles.toFixed(1);
    }

    return km.toFixed(1);
}

/**
 * Get translation for a key
 */
export function t(key, fallback = key) {
    const lang = LANGUAGES[currentLanguage];
    if (!lang || !lang.translations) {
        return fallback;
    }

    return lang.translations[key] || fallback;
}

/**
 * Get all available languages
 */
export function getAvailableLanguages() {
    return Object.entries(LANGUAGES).map(([code, lang]) => ({
        code,
        name: lang.name,
        flag: lang.flag
    }));
}

/**
 * Apply language to DOM
 * Sets lang attribute for RTL support etc.
 */
function applyLanguage(langCode) {
    document.documentElement.lang = langCode;

    // RTL support for Arabic
    if (langCode === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
    }

    console.log(`[i18n] Applied language: ${langCode}`);
}
