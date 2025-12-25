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
        connectionLost: "⚠️ Internet connection lost",
        connectionRestored: "⚡ Connection restored",
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
        "hero.passCardComing": "Pass card is being prepared...",

        // HUD Simplification
        "hudShowDetails": "Show details",
        "hudHideDetails": "Hide details",
        "hudDebug": "Debug",
        "hudDebugReady": "Debug console ready",

        // NASA Live
        "nasaLive": "NASA LIVE",
        "cam1": "High Definition",
        "cam2": "Standard Def",
        "cam3": "Media TV",
        "streamOffline": "Signal Lost / Offline",
        "streamLocked": "Stream Unavailable",

        // Crew
        "crewTitle": "Expedition Crew",
        "daysInSpace": "{d} days in space",
        "bioCdr": "Commander",
        "bioFe": "Flight Engineer",

        // Help
        "helpTitle": "Help & Guide",
        "helpDesc": "How to track the station",

        // Help System (Simplified for Elderly Users)
        help: {
            // Tabs
            tabAbout: "About ISS",
            tabGlossary: "Terms",
            tabTips: "Tips",

            // About Tab
            aboutTitle: "What is the Space Station?",
            aboutText1: "The International Space Station (ISS) is a large laboratory flying in space. It orbits Earth 16 times every day.",
            aboutText2: "Astronauts live there to do science experiments. It looks like a very bright moving star in the sky.",
            aboutSize: "Size: 109 meters (Like a football field)",
            aboutSpeed: "Speed: 28,000 km/h (17,500 mph)",

            // Glossary Tab
            termAos: "Appearance (AOS)",
            defAos: "The time when the station rises above the horizon and becomes visible.",
            termLos: "Disappearance (LOS)",
            defLos: "The time when the station goes below the horizon or enters Earth's shadow.",
            termAlt: "Altitude",
            defAlt: "How high the station is above the ground (approx. 400 km).",
            termMag: "Brightness",
            defMag: "How bright it looks. Negative numbers (like -3.0) mean very bright!",

            // Tips Tab
            tip1Title: "Look for a moving star",
            tip1Text: "It looks like a steady white light moving quickly across the sky. It does not blink.",
            tip2Title: "Best time to watch",
            tip2Text: "It is visible shortly after sunset or before sunrise.",
            tip3Title: "No telescope needed",
            tip3Text: "You can see it clearly with your naked eye."
        },

        // Phase 5: Notifications
        notify: {
            title: "ISS Tracker Hub",
            body30m: "Heads up! ISS pass in 30 minutes.",
            body10m: "Get ready! ISS pass in 10 minutes.",
            btnAlertOn: "🔔 Alerts On",
            btnAlertOff: "🔕 Alerts Off",
            permDenied: "⚠️ Alerts blocked. Please enable in browser settings.",
            keepOpen: "⚠️ Keep tab open to receive alerts",
            label: "Alerts (30m & 10m)"
        },

        // Crew & Live (Phase 4)
        crewParams: {
            title: "Expedition Crew",
            labelStatic: "ℹ️ Reference Data (Not Real-Time)",
            roleCdr: "Commander",
            roleFe: "Flight Engineer",
            bio1: "Veteran cosmonaut and commander of the station.",
            bio2: "Flight engineer on his first long-duration mission.",
            bio3: "Researching microgravity fluid dynamics.",
            bio4: "US Navy test pilot and NASA astronaut.",
            bio5: "Physician and veteran of two previous spaceflights.",
            bio6: "Aerospace engineer on her rookie mission.",
            bio7: "Cosmonaut with background in aircraft radio engineering."
        },
        nasa: {
            title: "NASA Live",
            streamCam1: "ISS Cam 1 (HD)",
            streamTv: "NASA TV",
            streamMedia: "Media Channel",
            btnStart: "📺 Start Live Stream",
            offline: "Stream Offline",
            locked: "Signal Locked"
        },

        // Weather (WMO Codes & Visibility)
        weather: {
            // WMO Codes
            code_0: "Clear sky",
            code_1: "Mainly clear",
            code_2: "Partly cloudy",
            code_3: "Overcast",
            code_45: "Fog",
            code_48: "Depositing rime fog",
            code_51: "Light drizzle",
            code_53: "Moderate drizzle",
            code_55: "Dense drizzle",
            code_61: "Slight rain",
            code_63: "Moderate rain",
            code_65: "Heavy rain",
            code_71: "Slight snow fall",
            code_73: "Moderate snow fall",
            code_75: "Heavy snow fall",
            code_80: "Slight rain showers",
            code_81: "Moderate rain showers",
            code_82: "Violent rain showers",
            code_95: "Thunderstorm",
            code_96: "Thunderstorm with hail",
            code_99: "Heavy thunderstorm",

            // Visibility Context (Elderly UX)
            visLabel: "Visibility",
            visGood: "Good – ISS clearly visible",
            visPoor: "Low – Clouds might block view"
        },

        // Mobile Navigation
        navMap: "Map",
        navTelemetry: "Telemetry",
        navPasses: "Passes",
        navSettings: "Settings",
        navNasaTV: "NASA TV",

        // Authentication
        authLogin: "Sign In",
        authSignup: "Sign Up",
        authLogout: "Sign Out",
        authEmail: "Email",
        authPassword: "Password",
        authName: "Full Name",
        authForgotPassword: "Forgot password?",
        authNoAccount: "Don't have an account?",
        authHasAccount: "Already have an account?",
        authGoogleSignIn: "Continue with Google",
        authWelcome: "Welcome",
        authProfile: "Profile",

        // Calendar and Notifications
        addToCalendar: "Add to Calendar",
        calendarDownloaded: "Downloaded!",
        enableNotifications: "Enable Notifications",
        notificationsEnabled: "Notifications Enabled",
        passReminder: "ISS Pass Reminder",

        // NASA Live & Skins
        nasaNote: "⚠️ Stream may have interruptions based on ISS signal status.",
        skinRealistic: "Realistic Mode",
        skinLiquid: "Liquid Mode",
        skinCyberpunk: "Cyberpunk Mode",

        nasaTitle: "NASA Live",
        nasaStart: "Start Stream",
        streamCam1: "HD View",
        streamTv: "NASA TV",
        streamMedia: "Media",

        crewParams: {
            title: "Expedition Crew",
            labelStatic: "Reference Data (Not Live)",
            bioCdr: "Commander",
            bioFe: "Flight Engineer",
            bio1: "Commander (Roscosmos)",
            bio2: "Flight Engineer (Roscosmos)",
            bio3: "Flight Engineer (NASA)",
            bio4: "Flight Engineer (NASA)",
            bio5: "Flight Engineer (NASA)",
            bio6: "Flight Engineer (NASA)",
            bio7: "Flight Engineer (Roscosmos)"
        }
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
        connectionLost: "⚠️ İnternet bağlantısı kesildi",
        connectionRestored: "⚡ Bağlantı geri geldi",
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
        "hero.passCardComing": "Geçiş kartı hazırlanıyor...",

        // HUD Simplification
        "hudShowDetails": "Detayları göster",
        "hudHideDetails": "Detayları gizle",
        "hudDebug": "Hata Ayıklama",
        "hudDebugReady": "Hata ayıklama konsolu hazır",

        // NASA Live
        "nasaLive": "NASA CANLI YAYIN",
        "cam1": "Yüksek Kalite (HD)",
        "cam2": "Standart (SD)",
        "cam3": "Medya TV",
        "streamOffline": "Sinyal Yok / Çevrimdışı",
        "streamLocked": "Yayın Kullanılamıyor",

        // Crew
        "crewTitle": "İstasyon Mürettebatı",
        "daysInSpace": "{d} gündür uzayda",
        "bioCdr": "Komutan",
        "bioFe": "Uçuş Mühendisi",

        // Help System (Simplified)
        help: {
            // Tabs
            tabAbout: "İstasyon Nedir?",
            tabGlossary: "Terimler",
            tabTips: "İpuçları",

            // About Tab
            aboutTitle: "Uzay İstasyonu Hakkında",
            aboutText1: "Uluslararası Uzay İstasyonu (ISS), uzayda uçan dev bir laboratuvardır. Dünya etrafında günde 16 tur atar.",
            aboutText2: "Astronotlar orada yaşar ve deneyler yapar. Gökyüzünde çok parlak, hareket eden bir yıldız gibi görünür.",
            aboutSize: "Boyut: 109 metre (Bir futbol sahası kadar)",
            aboutSpeed: "Hız: 28,000 km/s (Ses hızından 10 kat hızlı)",

            // Glossary Tab
            termAos: "Görüş Başlangıcı (AOS)",
            defAos: "İstasyonun ufuktan yükselip görünür olmaya başladığı an.",
            termLos: "Görüş Bitişi (LOS)",
            defLos: "İstasyonun ufuktan kaybolduğu veya Dünya'nın gölgesine girdiği an.",
            termAlt: "Yükseklik (İrtifa)",
            defAlt: "İstasyonun yerden ne kadar yüksekte olduğu (yaklaşık 400 km).",
            termMag: "Parlaklık",
            defMag: "Ne kadar parlak göründüğüdür. Eksi sayılar (örneğin -3.0) çok parlak demektir!",

            // Tips Tab
            tip1Title: "Hareket eden yıldıza bakın",
            tip1Text: "Gökyüzünde hızla kayan parlak, beyaz bir ışık gibidir. Uçaklar gibi yanıp sönmez.",
            tip2Title: "En iyi zaman",
            tip2Text: "Genellikle gün batımından hemen sonra veya gün doğumundan önce görülür.",
            tip3Title: "Teleskop gerekmez",
            tip3Text: "Çıplak gözle çok rahat görülebilir."
        },

        // Phase 5: Bildirimler
        notify: {
            title: "ISS Takip Merkezi",
            body30m: "Dikkat! ISS geçişine 30 dakika var.",
            body10m: "Hazırlan! ISS geçişine 10 dakika var.",
            btnAlertOn: "🔔 Bildirimler Açık",
            btnAlertOff: "🔕 Bildirimler Kapalı",
            permDenied: "⚠️ Bildirimler engellendi. Tarayıcı ayarlarından izin verin.",
            keepOpen: "⚠️ Bildirim almak için sekmeyi açık tutun",
            label: "Uyarılar (30dk & 10dk)"
        },

        // Mürettebat & Canlı Yayın (Phase 4)
        crewParams: {
            title: "Keşif Mürettebatı",
            labelStatic: "ℹ️ Referans Verisi (Canlı Değil)",
            roleCdr: "Komutan",
            roleFe: "Uçuş Mühendisi",
            bio1: "Tecrübeli kozmonot ve istasyon komutanı.",
            bio2: "İlk uzun süreli görevindeki uçuş mühendisi.",
            bio3: "Mikro yerçekimi sıvı dinamiği araştırmacısı.",
            bio4: "ABD Donanması test pilotu ve astronot.",
            bio5: "Doktor ve önceki iki uzay uçuşunun gazisi.",
            bio6: "Çaylak görevindeki havacılık mühendisi.",
            bio7: "Uçak radyo mühendisliği geçmişine sahip kozmonot."
        },
        nasa: {
            title: "NASA Canlı",
            streamCam1: "ISS Kamera 1 (HD)",
            streamTv: "NASA TV",
            streamMedia: "Medya Kanalı",
            btnStart: "📺 Yayını Başlat",
            offline: "Yayın Kapalı",
            locked: "Sinyal Yok"
        },

        // Hava Durumu (WMO Kodları & Görüş)
        weather: {
            // WMO Codes
            code_0: "Açık",
            code_1: "Çoğunlukla açık",
            code_2: "Parçalı bulutlu",
            code_3: "Kapalı",
            code_45: "Sisli",
            code_48: "Kırağılı sis",
            code_51: "Hafif çiseleme",
            code_53: "Orta çiseleme",
            code_55: "Yoğun çiseleme",
            code_61: "Hafif yağmurlu",
            code_63: "Orta yağmurlu",
            code_65: "Şiddetli yağmurlu",
            code_71: "Hafif kar yağışlı",
            code_73: "Orta kar yağışlı",
            code_75: "Yoğun kar yağışlı",
            code_80: "Hafif sağanak",
            code_81: "Orta sağanak",
            code_82: "Şiddetli sağanak",
            code_95: "Fırtına",
            code_96: "Dolu ile fırtına",
            code_99: "Şiddetli fırtına",

            // Visibility Context (Elderly UX)
            visLabel: "Görüş",
            visGood: "İyi – ISS net görülebilir",
            visPoor: "Düşük – Bulutlar engel olabilir"
        },

        // Mobile Navigation
        navMap: "Harita",
        navTelemetry: "Telemetri",
        navPasses: "Geçişler",
        navSettings: "Ayarlar",
        navNasaTV: "NASA TV",

        // Authentication
        authLogin: "Giriş Yap",
        authSignup: "Kayıt Ol",
        authLogout: "Çıkış Yap",
        authEmail: "E-posta",
        authPassword: "Şifre",
        authName: "Ad Soyad",
        authForgotPassword: "Şifremi unuttum",
        authNoAccount: "Hesabınız yok mu?",
        authHasAccount: "Zaten hesabınız var mı?",
        authGoogleSignIn: "Google ile devam et",
        authWelcome: "Hoş geldin",
        authProfile: "Profil",

        // Calendar and Notifications
        addToCalendar: "Takvime Ekle",
        calendarDownloaded: "İndirildi!",
        enableNotifications: "Bildirimleri Aç",
        notificationsEnabled: "Bildirimler Açık",
        passReminder: "ISS Geçiş Hatırlatıcısı",

        // NASA Live & Skins
        nasaNote: "⚠️ ISS sinyal durumuna göre canlı yayında kesintiler olabilir.",
        skinRealistic: "Gerçekçi Mod",
        skinLiquid: "Sıvı Mod",
        skinCyberpunk: "Siberpunk Mod",

        nasaTitle: "NASA Canlı",
        nasaStart: "Yayını Başlat",
        streamCam1: "HD Görüntü",
        streamTv: "NASA TV",
        streamMedia: "Medya",

        crewParams: {
            title: "Sefer Mürettebatı",
            labelStatic: "Referans Verisi (Canlı Değil)",
            bioCdr: "Komutan",
            bioFe: "Uçuş Mühendisi",
            bio1: "Komutan (Ruscosmos)",
            bio2: "Uçuş Mühendisi (Ruscosmos)",
            bio3: "Uçuş Mühendisi (NASA)",
            bio4: "Uçuş Mühendisi (NASA)",
            bio5: "Uçuş Mühendisi (NASA)",
            bio6: "Uçuş Mühendisi (NASA)",
            bio7: "Uçuş Mühendisi (Ruscosmos)"
        }
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

    // Nested key desteği (örn: 'notify.btnAlertOff')
    const getNestedValue = (obj, path) => {
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            } else {
                return undefined;
            }
        }
        return typeof current === 'string' ? current : undefined;
    };

    // Primary: Current language - önce nested, sonra direct
    const nestedValue = getNestedValue(dict, key);
    if (nestedValue) return nestedValue;
    if (dict && dict[key] && typeof dict[key] === 'string') return dict[key];

    // Fallback 1: TR (default)
    const trNested = getNestedValue(DICTIONARY['tr'], key);
    if (trNested) return trNested;
    if (DICTIONARY['tr'][key] && typeof DICTIONARY['tr'][key] === 'string') {
        return DICTIONARY['tr'][key];
    }

    // Fallback 2: EN
    const enNested = getNestedValue(DICTIONARY['en'], key);
    if (enNested) return enNested;
    if (DICTIONARY['en'][key] && typeof DICTIONARY['en'][key] === 'string') {
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
