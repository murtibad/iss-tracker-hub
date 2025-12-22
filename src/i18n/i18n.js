// src/i18n/i18n.js
// Internationalization system - Dictionary based v0.3.1

const STORAGE_KEY = 'isshub:language';
let currentLanguage = 'tr'; // Default logic will overwrite

// Dictionary
const DICTIONARY = {
    en: {
        // Common
        speed: "Speed",
        altitude: "Altitude",
        lat: "Latitude",
        lon: "Longitude",
        close: "Close",
        save: "Save",
        cancel: "Cancel",

        // UI Components
        settings: "Settings",
        theme: "Theme",
        language: "Language",
        units: "Units",
        crew: "Crew",
        follow: "Follow",
        on: "ON",
        off: "OFF",

        // Status
        connectionStable: "Connection stable",
        daylight: "Daylight",
        eclipse: "Eclipse",

        // Location
        tools: "Tools",
        location: "Location",
        changeLocation: "Change Location",
        passDepend: "Pass predictions depend on location",
        locationModalTitle: "Location Settings",
        locationModalDesc: "Select your location for accurate pass predictions",
        locGpsRequesting: "Requesting GPS location...",
        locGpsSuccess: "Location acquired",
        locGpsFailed: "GPS failed",
        locSearchFailed: "Search failed",
        locSaved: "Location saved",
        useMyLocation: "Use My Location (GPS)",
        searchLocation: "Search Location",
        searchPlaceholder: "Search: \"London\" / \"Tokyo\" ...",
        selection: "Selection",
        noSelection: "No selection",
        noResults: "No results. Try broader terms (e.g., \"London\").",
        searching: "Searching...",
        selectCity: "Select a city",
        followActive: "Tracking: ON",
        followInactive: "Tracking: OFF",

        // Pass Predictions
        passNoLocation: "No location set",
        passCalculating: "Calculating pass...",
        passNotFound: "No visible pass found",
        passError: "Pass calculation error",

        // Pass Card
        passCardTitle: "Next Pass",
        passVisible: "✅ VISIBLE",
        passPoorAngle: "🔴 DIFFICULT (Low Angle: {deg}°)",
        passInvisible: "🔴 INVISIBLE",
        passNone: "No upcoming pass",
        passDetails: "Details",
        passClose: "Close",
        passDuration: "Duration",
        passFirstVisible: "First visible pass",
        passHoursMinutes: "{h}h {m}min later ({time})",
        passNotFoundDetails: "not found",
        passMinutes: "{min} min",

        // Errors
        globeLoadFailed: "3D Globe failed to load",
        globeError: "Globe error",
        bootReady: "App ready",
        locationSet: "Location set",
        offline: "Offline. Retrying...",
        staleData: "Data may be outdated",
        reconnecting: "Reconnecting...",
        trajectoryCalculating: "Calculating trajectory...",
        trajectoryError: "Trajectory error",

        // Landing Hero
        "hero.headline": "The ISS is currently over Earth",
        "hero.subline.loading": "Calculating pass times...",
        "hero.subline.pass": "Visible from your location in {minutes} minutes",
        "hero.subline.permission": "Enable location to see when ISS passes overhead",
        "hero.subline.unavailable": "Pass calculation unavailable",
        "hero.cta.showPass": "Show Pass",
        "hero.cta.liveTrack": "Live Track",
        "hero.passCardComing": "Pass card is being prepared..."
    },
    tr: {
        // Genel
        speed: "Hız",
        altitude: "İrtifa",
        lat: "Enlem",
        lon: "Boylam",
        close: "Kapat",
        save: "Kaydet",
        cancel: "İptal",

        // UI Bileşenleri
        settings: "Ayarlar",
        theme: "Tema",
        language: "Dil",
        units: "Birimler",
        crew: "Mürettebat",
        follow: "Takip",
        on: "AÇIK",
        off: "KAPALI",

        // Durum
        connectionStable: "Bağlantı kararlı",
        daylight: "Gündüz",
        eclipse: "Tutulma (Gece)",

        // Konum
        tools: "Araçlar",
        location: "Konum",
        changeLocation: "Konum Değiştir",
        passDepend: "Geçiş tahminleri konuma bağlıdır",
        locationModalTitle: "Konum Ayarları",
        locationModalDesc: "Doğru geçiş tahminleri için konumunuzu seçin",
        locGpsRequesting: "GPS konumu isteniyor...",
        locGpsSuccess: "Konum alındı",
        locGpsFailed: "GPS başarısız",
        locSearchFailed: "Arama başarısız",
        locSaved: "Konum kaydedildi",
        useMyLocation: "Konumumu Kullan (GPS)",
        searchLocation: "Arama ile Seç",
        searchPlaceholder: "Ara: \"Bursa\" / \"Istanbul\" ...",
        selection: "Seçim",
        noSelection: "Seçim yapılmadı",
        noResults: "Sonuç yok. Daha genel yaz (örn: \"Bursa\").",
        searching: "Aranıyor...",
        selectCity: "Şehir seçin",
        followActive: "Takip: Açık",
        followInactive: "Takip: Kapalı",

        // Geçiş Tahminleri
        passNoLocation: "Konum belirtilmedi",
        passCalculating: "Geçiş hesaplanıyor...",
        passNotFound: "Görünür geçiş bulunamadı",
        passError: "Geçiş hesaplama hatası",

        // Geçiş Kartı
        passCardTitle: "Sıradaki Geçiş",
        passVisible: "✅ GÖRÜNÜR",
        passPoorAngle: "🔴 ZOR (Düşük Açı: {deg}°)",
        passInvisible: "🔴 GÖRÜNMEZ",
        passNone: "Yakında geçiş yok",
        passDetails: "Detaylar",
        passClose: "Kapat",
        passDuration: "Süre",
        passFirstVisible: "İlk görünür geçiş",
        passHoursMinutes: "{h}sa {m}dk sonra ({time})",
        passNotFoundDetails: "bulunamadı",
        passMinutes: "{min} dk",

        // Hatalar
        globeLoadFailed: "3D Küre yüklenemedi",
        globeError: "Küre hatası",
        bootReady: "Uygulama hazır",
        locationSet: "Konum ayarlandı",
        offline: "Çevrimdışı. Tekrar deneniyor...",
        staleData: "Veriler güncel olmayabilir",
        reconnecting: "Yeniden bağlanılıyor...",
        trajectoryCalculating: "Yörünge hesaplanıyor...",
        trajectoryError: "Yörünge hatası",

        // Landing Hero
        "hero.headline": "ISS şu an Dünya'nın üzerinde",
        "hero.subline.loading": "Geçiş hesaplanıyor...",
        "hero.subline.pass": "{minutes} dakika sonra bulunduğun konumdan görülebilir",
        "hero.subline.permission": "Konum izni vererek geçiş zamanını öğren",
        "hero.subline.unavailable": "Geçiş hesaplaması kullanılamıyor",
        "hero.cta.showPass": "Geçişi Göster",
        "hero.cta.liveTrack": "Canlı Takip Et",
        "hero.passCardComing": "Geçiş kartı hazırlanıyor..."
    },
    // Scalable Structure for 18 Languages (Restored)
    de: {}, fr: {}, es: {}, it: {}, ru: {}, ja: {}, zh: {}, pt: {}, hi: {},
    ar: {}, bn: {}, ko: {}, nl: {}, pl: {}, ro: {}, sv: {}
};

export async function initI18n() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved && DICTIONARY[saved]) {
        // User has explicitly chosen a language
        currentLanguage = saved;
    } else {
        // Detect browser language
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0]; // 'en-US' -> 'en'

        if (DICTIONARY[langCode]) {
            currentLanguage = langCode;
        } else {
            // Default to TR if unsupported language
            currentLanguage = 'tr';
        }
    }

    applyLanguage(currentLanguage);
    return currentLanguage;
}

export function getCurrentLanguage() {
    return currentLanguage;
}

export function setLanguage(lang) {
    // if (lang !== 'en' && lang !== 'tr') return; // Allow all supported languages
    if (!DICTIONARY[lang]) lang = 'en'; // Fallback logic assignment if needed, but current implementation uses keys
    currentLanguage = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyLanguage(lang);

    // Broadcast event for reactive components
    window.dispatchEvent(new CustomEvent('language-change', { detail: lang }));
}

export function t(key) {
    const dict = DICTIONARY[currentLanguage];

    // Primary: Current language
    if (dict && dict[key]) {
        return dict[key];
    }

    // Fallback 1: TR (default)
    if (currentLanguage !== 'tr' && DICTIONARY['tr'][key]) {
        console.warn(`[i18n] Missing "${key}" in "${currentLanguage}", using TR fallback`);
        return DICTIONARY['tr'][key];
    }

    // Fallback 2: EN
    if (currentLanguage !== 'en' && DICTIONARY['en'][key]) {
        console.warn(`[i18n] Missing "${key}" in "${currentLanguage}", using EN fallback`);
        return DICTIONARY['en'][key];
    }

    // Last resort: return key itself
    console.warn(`[i18n] Missing translation key: "${key}"`);
    return key;
}

// Helper: Smart Unit Conversion
// EN -> Imperial (mph, mi)
// TR -> Metric (km/h, km)
export function getSmartUnits(velocityKmh, altitudeKm) {
    const isImperial = currentLanguage === 'en';

    if (isImperial) {
        return {
            speed: Math.round(velocityKmh * 0.621371).toLocaleString('en-US'),
            speedUnit: 'mph',
            altitude: (altitudeKm * 0.621371).toFixed(1),
            altUnit: 'mi'
        };
    } else {
        return {
            speed: Math.round(velocityKmh).toLocaleString('tr-TR'),
            speedUnit: 'km/h',
            altitude: altitudeKm.toFixed(1),
            altUnit: 'km'
        };
    }
}

// Helper: Get plain units
export function getSpeedUnit() {
    return currentLanguage === 'en' ? 'mph' : 'km/h';
}

export function getDistanceUnit() {
    return currentLanguage === 'en' ? 'mi' : 'km';
}

function applyLanguage(lang) {
    document.documentElement.lang = lang;
    // Update simple text elements marked with [data-i18n]
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (key) el.textContent = t(key);
    });
}
