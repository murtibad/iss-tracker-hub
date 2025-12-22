// src/i18n/languages.js
// Multi-language support - Çok dilli destek

export const LANGUAGES = {
    tr: {
        name: 'Türkçe',
        flag: '🇹🇷',
        code: 'tr',
        translations: {
            // App title
            appTitle: 'ISS Tracker HUB',

            // Topbar
            altitude: 'İrtifa',
            speed: 'Hız',
            location: 'Konum',
            nextPass: 'En Yakın Geçiş',

            // Buttons
            colorPicker: 'Renk',
            theme: 'Tema',
            skin: 'Şeffaflık',
            realistic: 'Gerçekçi',
            city: 'Şehir',
            crew: 'Mürettebat',
            language: 'Dil',
            follow: 'Takip',
            on: 'Açık',
            off: 'Kapalı',
            system: 'Sistem',
            dark: 'Koyu',
            light: 'Açık',
            myLocation: 'Konumum',
            settings: 'Ayarlar',
            navMap: 'Harita',
            navTelemetry: 'Veriler',
            navPasses: 'Geçişler',
            hudShowDetails: 'Detaylar',
            hudHideDetails: 'Gizle',
            hudDebug: 'Terminal',

            // Modals
            selectLocation: 'Yer Seçimi',
            searchCity: 'Şehir Ara',
            enterManually: 'Manuel Gir',
            close: 'Kapat',

            // Crew
            crewOnboard: 'ISS Mürettebatı',
            readMore: 'Devamını Oku',

            // Widgets
            telemetry: 'Telemetri',
            distances: 'Mesafeler',
            communication: 'İletişim',
            timeSystem: 'Zaman Sistemi',
            solarArray: 'Solar Array',

            // Telemetry
            latitude: 'Enlem',
            longitude: 'Boylam',
            surfaceStatus: 'Yüzey Durumu',
            orbitProgress: 'Yörünge İlerlemesi',

            // Distances
            distanceToSun: 'Güneş\'ten Uzaklık',
            distanceToEarth: 'Dünya\'ya Mesafe',
            distanceToMoon: 'Ay\'a Uzaklık',

            // Communication
            signalStatus: 'Sinyal Durumu',
            active: 'AKTİF',

            // Time
            utcTime: 'UTC Saati',
            localTime: 'Yerel Saat',
            uptime: 'Artırım Süresi',

            // Solar
            powerGeneration: 'Enerji Üretimi',

            // Welcome modal
            welcomeTitle: 'ISS\'i Görmek İster misin?',
            welcomeDesc: 'Konumunu paylaş, ISS tam üstünden geçtiğinde sana haber verelim!',
            autoDetect: 'Otomatik Tespit',
            manualEntry: 'Manuel Gir',

            // Pass prediction
            visible: 'GÖRÜNMEZ',
            maxElevation: 'MAX',
            aos: 'AOS',
            los: 'LOS',

            // Units
            km: 'km',
            kmh: 'km/h',
            kw: 'kW',
            degrees: '°',

            // Terminal/Console
            bootReady: 'boot> hazır',
            locationSet: 'Konum ayarlandı',
            themeChanged: 'Tema değişti',
            passCalculating: 'pass> hesaplanıyor…',
            passNotFound: 'pass> 36 saat içinde geçiş bulunamadı',
            passNoLocation: 'pass> konum yok: geçiş hesabı yapılamadı',
            passError: 'pass> HATA',
            locGpsRequesting: 'loc> GPS isteniyor…',
            locGpsSuccess: 'loc> GPS reverse ok',
            locGpsFailed: 'loc> GPS/Reverse başarısız',
            locSaved: 'loc> kaydedildi',
            locSearchFailed: 'loc> Nominatim arama başarısız',
            globeLoadFailed: '3D globe yüklenemedi',
            globeError: '3D globe hatası',
            telemetryError: 'HATA: telemetri alınamadı',

            // Location Modal
            locationModalTitle: 'Yer Seçimi (OSM)',
            locationModalDesc: 'Geçiş hesabı seçtiğin konuma göre yapılır. Kaydedince \'En Yakın Geçiş\' otomatik hesaplanır.',
            useMyLocation: 'Konumumu Kullan (GPS)',
            searchWithText: 'Arama ile Seç',
            searchPlaceholder: 'Ara: “Bursa Osmangazi” / “Istanbul Kadikoy” …',
            selection: 'Seçim',
            save: 'Kaydet',
        }
    },

    en: {
        name: 'English',
        flag: '🇬🇧',
        code: 'en',
        translations: {
            appTitle: 'ISS Tracker HUB',

            altitude: 'Altitude',
            speed: 'Speed',
            location: 'Location',
            nextPass: 'Next Pass',

            colorPicker: 'Color',
            theme: 'Theme',
            skin: 'Skin',
            realistic: 'Realistic',
            city: 'City',
            crew: 'Crew',
            language: 'Language',
            follow: 'Follow',
            on: 'On',
            off: 'Off',
            system: 'System',
            dark: 'Dark',
            light: 'Light',
            myLocation: 'My Location',
            settings: 'Settings',
            navMap: 'Map',
            navTelemetry: 'Telemetry',
            navPasses: 'Passes',
            hudShowDetails: 'Show Details',
            hudHideDetails: 'Hide Details',
            hudDebug: 'Debug',

            selectLocation: 'Select Location',
            searchCity: 'Search City',
            enterManually: 'Enter Manually',
            close: 'Close',

            crewOnboard: 'ISS Crew',
            readMore: 'Read More',

            telemetry: 'Telemetry',
            distances: 'Distances',
            communication: 'Communication',
            timeSystem: 'Time System',
            solarArray: 'Solar Array',

            latitude: 'Latitude',
            longitude: 'Longitude',
            surfaceStatus: 'Surface Status',
            orbitProgress: 'Orbit Progress',

            distanceToSun: 'Distance to Sun',
            distanceToEarth: 'Distance to Earth',
            distanceToMoon: 'Distance to Moon',

            signalStatus: 'Signal Status',
            active: 'ACTIVE',

            utcTime: 'UTC Time',
            localTime: 'Local Time',
            uptime: 'Uptime',

            powerGeneration: 'Power Generation',

            welcomeTitle: 'Want to See the ISS?',
            welcomeDesc: 'Share your location and we\'ll notify you when ISS passes overhead!',
            autoDetect: 'Auto Detect',
            manualEntry: 'Manual Entry',

            visible: 'VISIBLE',
            maxElevation: 'MAX',
            aos: 'AOS',
            los: 'LOS',

            km: 'km',
            kmh: 'km/h',
            kw: 'kW',
            degrees: '°',

            // Terminal/Console
            bootReady: 'boot> ready',
            locationSet: 'Location set',
            themeChanged: 'Theme changed',
            passCalculating: 'pass> calculating…',
            passNotFound: 'pass> no pass found in next 36 hours',
            passNoLocation: 'pass> no location: cannot calculate pass',
            passError: 'pass> ERROR',
            locGpsRequesting: 'loc> requesting GPS…',
            locGpsSuccess: 'loc> GPS reverse ok',
            locGpsFailed: 'loc> GPS/Reverse failed',
            locSaved: 'loc> saved',
            locSearchFailed: 'loc> Nominatim search failed',
            globeLoadFailed: '3D globe failed to load',
            globeError: '3D globe error',
            telemetryError: 'ERROR: could not fetch telemetry',

            // Location Modal
            locationModalTitle: 'Select Location (OSM)',
            locationModalDesc: 'Pass calculations are based on your selected location. Predictions are recalculated when you save.',
            useMyLocation: 'Use My Location (GPS)',
            searchWithText: 'Search Manually',
            searchPlaceholder: 'Search: "Istanbul Kadikoy" / "Bursa Osmangazi" …',
            selection: 'Selection',
            save: 'Save',
        }
    },

    es: {
        name: 'Español',
        flag: '🇪🇸',
        code: 'es',
        translations: {
            appTitle: 'ISS Tracker HUB',
            altitude: 'Altitud',
            speed: 'Velocidad',
            location: 'Ubicación',
            nextPass: 'Próximo Pase',
            colorPicker: 'Color',
            theme: 'Tema',
            skin: 'Piel',
            city: 'Ciudad',
            crew: 'Tripulación',
            language: 'Idioma',
            telemetry: 'Telemetría',
            distances: 'Distancias',
            communication: 'Comunicación',
            timeSystem: 'Sistema de Tiempo',
            solarArray: 'Panel Solar',
            km: 'km',
            kmh: 'km/h',
            kw: 'kW',
        }
    },

    fr: {
        name: 'Français',
        flag: '🇫🇷',
        code: 'fr',
        translations: {
            appTitle: 'ISS Tracker HUB',
            altitude: 'Altitude',
            speed: 'Vitesse',
            location: 'Emplacement',
            nextPass: 'Prochain Passage',
            colorPicker: 'Couleur',
            theme: 'Thème',
            city: 'Ville',
            crew: 'Équipage',
            language: 'Langue',
            telemetry: 'Télémétrie',
            distances: 'Distances',
            communication: 'Communication',
            timeSystem: 'Système de Temps',
            solarArray: 'Panneau Solaire',
            km: 'km',
            kmh: 'km/h',
            kw: 'kW',
        }
    },

    de: {
        name: 'Deutsch',
        flag: '🇩🇪',
        code: 'de',
        translations: {
            appTitle: 'ISS Tracker HUB',
            altitude: 'Höhe',
            speed: 'Geschwindigkeit',
            location: 'Standort',
            nextPass: 'Nächster Pass',
            colorPicker: 'Farbe',
            theme: 'Thema',
            city: 'Stadt',
            crew: 'Besatzung',
            language: 'Sprache',
            telemetry: 'Telemetrie',
            distances: 'Entfernungen',
            communication: 'Kommunikation',
            timeSystem: 'Zeitsystem',
            solarArray: 'Solarmodul',
            km: 'km',
            kmh: 'km/h',
            kw: 'kW',
        }
    },

    ru: {
        name: 'Русский',
        flag: '🇷🇺',
        code: 'ru',
        translations: {
            appTitle: 'ISS Tracker HUB',
            altitude: 'Высота',
            speed: 'Скорость',
            location: 'Местоположение',
            nextPass: 'Следующий Проход',
            colorPicker: 'Цвет',
            theme: 'Тема',
            city: 'Город',
            crew: 'Экипаж',
            language: 'Язык',
            telemetry: 'Телеметрия',
            distances: 'Расстояния',
            communication: 'Связь',
            timeSystem: 'Система Времени',
            solarArray: 'Солнечная Батарея',
            km: 'км',
            kmh: 'км/ч',
            kw: 'кВт',
        }
    },

    zh: {
        name: '中文',
        flag: '🇨🇳',
        code: 'zh',
        translations: {
            appTitle: 'ISS Tracker HUB',
            altitude: '高度',
            speed: '速度',
            location: '位置',
            nextPass: '下次经过',
            colorPicker: '颜色',
            theme: '主题',
            city: '城市',
            crew: '宇航员',
            language: '语言',
            telemetry: '遥测',
            distances: '距离',
            communication: '通讯',
            timeSystem: '时间系统',
            solarArray: '太阳能电池板',
            km: '公里',
            kmh: '公里/小时',
            kw: '千瓦',
        }
    },

    ja: {
        name: '日本語',
        flag: '🇯🇵',
        code: 'ja',
        translations: {
            appTitle: 'ISS Tracker HUB',
            altitude: '高度',
            speed: '速度',
            location: '位置',
            nextPass: '次のパス',
            colorPicker: '色',
            theme: 'テーマ',
            city: '都市',
            crew: 'クルー',
            language: '言語',
            telemetry: 'テレメトリ',
            distances: '距離',
            communication: '通信',
            timeSystem: '時間システム',
            solarArray: 'ソーラーアレイ',
            km: 'km',
            kmh: 'km/h',
            kw: 'kW',
        }
    },

    ar: {
        name: 'العربية',
        flag: '🇸🇦',
        code: 'ar',
        translations: {
            appTitle: 'ISS Tracker HUB',
            altitude: 'الارتفاع',
            speed: 'السرعة',
            location: 'الموقع',
            nextPass: 'المرور التالي',
            colorPicker: 'اللون',
            theme: 'المظهر',
            city: 'المدينة',
            crew: 'الطاقم',
            language: 'اللغة',
            telemetry: 'القياس عن بعد',
            distances: 'المسافات',
            communication: 'الاتصالات',
            timeSystem: 'نظام الوقت',
            solarArray: 'الألواح الشمسية',
            km: 'كم',
            kmh: 'كم/س',
            kw: 'كيلوواط',
        }
    }
};

// Country code to language mapping
export const COUNTRY_TO_LANGUAGE = {
    TR: 'tr',
    US: 'en',
    GB: 'en',
    CA: 'en',
    AU: 'en',
    ES: 'es',
    MX: 'es',
    AR: 'es',
    CO: 'es',
    FR: 'fr',
    DE: 'de',
    RU: 'ru',
    CN: 'zh',
    TW: 'zh',
    HK: 'zh',
    JP: 'ja',
    SA: 'ar',
    AE: 'ar',
    EG: 'ar',
    // Add more as needed
};
