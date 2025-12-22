# 🛰️ ISS Tracker HUB

Real-time International Space Station tracking with 3D visualization and personalized pass predictions.

**Current Version:** v0.3.3 (beta)

## ✨ Features

### Core Tracking
- 🌍 **2D/3D View Toggle** - MapLibre GL map or immersive 3D globe
- 🛰️ **Real-time Telemetry** - Live ISS position, velocity, altitude
- 📍 **Pass Predictions** - Calculate when ISS is visible from your location
- 🌤️ **Weather Integration** - Current conditions at ISS location

### PWA & Offline
- 📱 **Installable PWA** - Add to home screen, works like a native app
- 🔌 **Offline-ready** - App shell cached for offline usage
- 🚀 **Runtime Caching** - ISS API and geocoding cached (Network First)
- ⚠️ **Network Status** - Visual indicators for offline/stale data

### Localization & Accessibility
- 🌐 **i18n Support** - Turkish (TR) and English (EN)
- ♿ **A11y Baseline** - Keyboard navigation, ARIA labels, focus management
- 🎨 **Glassmorphism UI** - Modern, premium design

### Additional
- 👨‍🚀 **Crew Info** - Who's on the ISS right now
- 📱 **Fully Responsive** - Desktop, tablet, mobile

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🌐 Live Demo

[View on GitHub Pages](https://github.com/yourusername/iss-tracker-hub)

## 📡 Data Sources

- **ISS Position**: [Where The ISS At API](https://wheretheiss.at/)
- **Weather**: [Open-Meteo](https://open-meteo.com/)
- **Crew**: [Open Notify API](http://open-notify.org/)
- **Geocoding**: [Nominatim / OpenStreetMap](https://nominatim.openstreetmap.org/)

## 🛠️ Tech Stack

### Core
- ⚡ **Vite** - Fast build tool
- 🗺️ **MapLibre GL** - 2D map rendering
- 🌍 **Globe.gl** - 3D Earth visualization
- 🎨 **Vanilla JS** - No framework, pure JavaScript

### PWA & Caching
- 📦 **vite-plugin-pwa** - Service Worker generation
- 🔄 **Workbox** - Runtime caching strategies
- 💾 **Cache First** - App shell (HTML/CSS/JS/icons)
- 🌐 **Network First** - API data (ISS: 5min TTL, Geocoding: 24h TTL)

### Utilities
- 📐 **satellite.js** - TLE-based orbit calculations
- 🌍 **i18n** - Custom lightweight translation system
- ♿ **A11y** - WCAG 2.1 baseline compliance

## 📂 Project Structure

```
iss-tracker-hub/
├── public/
│   ├── icons/              # PWA icons
│   └── manifest.json       # PWA manifest
├── src/
│   ├── app/
│   │   └── boot.js         # Main application entry
│   ├── ui/
│   │   ├── components/     # Reusable UI components
│   │   ├── globeView.js    # 3D globe
│   │   ├── maplibreView.js # 2D map
│   │   └── ...
│   ├── services/
│   │   ├── prediction.js   # Pass calculations
│   │   ├── issMotion.js    # Telemetry & interpolation
│   │   └── weather.js      # Weather API
│   ├── i18n/
│   │   └── i18n.js         # Translation system
│   └── styles/
│       └── theme.css       # Glassmorphism theme
├── vite.config.js          # Vite + PWA config
└── package.json
```

## 🔧 Configuration

Edit `src/constants/config.js`:
- Update intervals (telemetry, weather, predictions)
- Minimum pass elevation angle
- Default theme/language
- API endpoints

## 🌐 PWA Notes

### What Works Offline
- ✅ App shell (UI, styles, scripts)
- ✅ Cached ISS data (up to 5 minutes old)
- ✅ Cached geocoding results (up to 24 hours old)

### What Requires Network
- ❌ Live ISS telemetry updates
- ❌ Fresh weather data
- ❌ New geocoding searches

### Intentionally Excluded
- Push notifications (beta scope)
- Background sync (future enhancement)

## 🎯 Roadmap

### Completed (v0.3.3)
- ✅ i18n Phase 1 & 2 (TR/EN)
- ✅ PWA Phase 1 & 2 (Installable + Runtime caching)
- ✅ A11y baseline (keyboard nav, ARIA, focus)
- ✅ Offline/stale status indicators
- ✅ **Mobile UX Upgrade** (Bottom Navigation Bar)
- ✅ **3D Globe** (Singleton fixes & Performance)
- ✅ **GitHub Pages Compatibility** (Fixed paths & API keys)

### Backlog (Nice-to-Have)
- Advanced error handling
- Code splitting & lazy loading
- Push notifications (opt-in)

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

## 📜 License

MIT

## 🙏 Acknowledgments

- NASA and the ISS crew
- Open-source API providers
- OpenStreetMap community
- Vite & Workbox teams

---

**Made with ❤️ for space enthusiasts**

**Status:** Beta | **Version:** v0.3.3 | **Last Updated:** December 2025
