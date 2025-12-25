# 🛰️ ISS Tracker HUB

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://murtibad.github.io/iss-tracker-hub/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.1.0-orange)](package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Real-time International Space Station tracking with immersive 3D visualization and personalized pass predictions.

![ISS Tracker Hub](https://img.shields.io/badge/ISS-Tracker%20Hub-00d4ff?style=for-the-badge&logo=nasa&logoColor=white)

## 🆕 What's New in v1.1.0 (December 25, 2024)

### 🌙 Immersive 3D Experience
- **Realistic Moon & Sun** - Beautiful celestial bodies with glow/corona effects
- **Dynamic Theme System** - Light mode: white space with dark stars / Dark mode: black space with white stars
- **Theme-aware 2D Map** - MapTiler Positron (light) / Darkmatter (dark) automatic switching
- **Globe Atmosphere Glow** - Dynamically matches your chosen accent color

### 🎨 Complete Theme Overhaul
- Full UI transformation between light/dark modes (not just text colors!)
- Cards, panels, and all components adapt to theme
- Smooth CSS transitions and animations throughout the app
- "Butter smooth" feel with staggered entry animations

### � NASA Live Stream
- Updated to reliable YouTube embed sources (NASA TV Public, ISS HD Earth View)
- Full i18n support for stream labels (Turkish/English)
- Professional UI without emojis

### 👨‍🚀 Crew Widget Improvements
- Added complete `crewParams` translations (TR/EN)
- Image fallback for broken Wikipedia links
- Fixed "undefined" role text issue

### 🗺️ Map & Navigation Fixes
- **2D Map Drag Fix** - Users can now freely pan the map (follow mode disables on interaction)
- **Trajectory Lines Fix** - Proper antimeridian (180°/-180°) crossing handling
- No more lines cutting through the Earth!

### 🔧 Technical Improvements
- Removed intrusive "Veriler güncel olmayabilir" (stale data) warning bar
- Auth modal error animations
- Help modal professional styling (removed emojis)
- HUD layout spacing improvements
- ESLint configuration added
- Motion utilities refactored

### 📦 New Files
- `src/styles/animations.css` - Global smooth animations
- `src/ui/intro.js` - Landing animation system
- `src/ui/widgets/apiStatusWidget.js` - API status monitoring
- `CHANGELOG.md` - Version history
- `CONTRIBUTING.md` - Contribution guidelines

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌍 **2D/3D Toggle** | Seamless switch between MapLibre Dark Matter and immersive 3D globe |
| 🛰️ **Real-time Telemetry** | Live ISS position, velocity (27,600 km/h), and altitude (408 km) |
| 📍 **Pass Predictions** | SGP4-based calculations for when ISS is visible from your location |
| 👨‍🚀 **Live Crew Info** | Current ISS expedition members fetched from Open Notify API |
| 📺 **NASA Live Stream** | HD Earth views from space with multiple camera options |
| 🌤️ **Weather Context** | Current viewing conditions at ISS ground track location |
| 🔌 **PWA & Offline** | Installable, works offline with cached data |
| 🌐 **i18n Support** | Turkish (TR) and English (EN) with smart units |
| ♿ **Accessibility** | WCAG 2.1 baseline, elderly-friendly (18px base font) |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/murtibad/iss-tracker-hub.git
cd iss-tracker-hub

# Install dependencies
npm install

# Create environment file (see Configuration section)
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Live Demo

**[View on GitHub Pages →](https://murtibad.github.io/iss-tracker-hub/)**

## 📡 Data Sources

| Provider | Data |
|----------|------|
| [Where The ISS At](https://wheretheiss.at/) | Primary ISS telemetry (lat, lon, alt, velocity) |
| [Open Notify API](http://open-notify.org/) | Crew information, fallback position |
| [CelesTrak](https://celestrak.org/) | TLE data for SGP4 calculations |
| [Open-Meteo](https://open-meteo.com/) | Weather at ISS ground location |
| [Nominatim/OSM](https://nominatim.openstreetmap.org/) | Geocoding for location search |

## 🛠️ Tech Stack

### Core
- ⚡ **[Vite 6](https://vitejs.dev/)** - Fast build tool with HMR
- 🗺️ **[MapLibre GL](https://maplibre.org/)** - 2D map rendering (Dark Matter theme)
- 🌍 **[Globe.gl](https://globe.gl/)** - 3D Earth visualization with Three.js
- 🎨 **Vanilla JS** - No framework, pure ES6+ JavaScript

### Science
- 📐 **[satellite.js](https://github.com/shashwatak/satellite-js)** - TLE/SGP4 orbit calculations
- 🌐 **Custom i18n** - Lightweight translation system

### PWA & Caching
- 📦 **[vite-plugin-pwa](https://vite-plugin-pwa.netlify.app/)** - Service Worker generation
- 🔄 **Workbox** - Runtime caching strategies
- 💾 **Cache First** - App shell (HTML/CSS/JS)
- 🌐 **Network First** - API data (5min/24h TTL)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# MapTiler API Key (Required for 2D map)
VITE_MAPTILER_API_KEY=your_maptiler_key

# Firebase (Optional - for future authentication)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Application Config

Edit `src/constants/config.js` for:
- Update intervals (telemetry, weather, predictions)
- Minimum pass elevation angle (default: 20°)
- API endpoints
- UI timing settings

## 📂 Project Structure

```
iss-tracker-hub/
├── public/
│   ├── icons/              # PWA icons (192, 512px)
│   ├── models/             # 3D models (ISS.glb)
│   └── manifest.json       # PWA manifest
├── src/
│   ├── app/
│   │   └── boot.js         # Main application entry & orchestration
│   ├── ui/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── floatingHUD.js
│   │   │   ├── NASALiveCard.js
│   │   │   ├── mobileNavBar.js
│   │   │   └── toastManager.js
│   │   ├── globeView.js    # 3D globe (Globe.gl + Three.js)
│   │   ├── maplibreView.js # 2D map (MapLibre GL)
│   │   └── passCardView.js # Pass prediction display
│   ├── services/
│   │   ├── iss.js          # 3-tier ISS data fetcher
│   │   ├── issMotion.js    # 60fps smooth interpolation
│   │   ├── prediction.js   # SGP4 pass calculations
│   │   ├── crew.js         # Dynamic crew fetching
│   │   └── weather.js      # Open-Meteo integration
│   ├── utils/
│   │   └── utils.js        # Common helpers (DRY)
│   ├── constants/
│   │   └── config.js       # Centralized configuration
│   ├── i18n/
│   │   └── i18n.js         # Translation system (TR/EN)
│   └── styles/
│       ├── theme.css       # Main theme (glassmorphism)
│       ├── layout.css      # Responsive grid
│       ├── animations.css  # Micro-interactions
│       └── accessibility.css
├── vite.config.js          # Vite + PWA configuration
└── package.json
```

## 🌐 PWA Features

### What Works Offline
- ✅ App shell (UI, styles, scripts)
- ✅ Cached ISS data (up to 5 minutes old)
- ✅ Cached geocoding results (up to 24 hours old)
- ✅ 3D model assets

### What Requires Network
- ❌ Live ISS telemetry updates
- ❌ Fresh weather data
- ❌ New geocoding searches
- ❌ NASA live streams

## 🎯 Roadmap

### ✅ Completed (v1.0.0)
- Real-time 2D/3D ISS tracking
- SGP4-based pass predictions
- Dynamic crew info from API
- NASA live stream integration
- PWA with offline support
- i18n (TR/EN) with smart units
- Accessibility baseline (WCAG 2.1)
- Modern animations & transitions
- Mobile-responsive bottom navigation

### 🔮 Future Enhancements
- [ ] Day/Night terminator visualization
- [ ] Push notifications for passes
- [ ] Multiple satellite tracking
- [ ] Historical pass data
- [ ] User accounts & saved locations

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

```bash
# Fork the repo, then:
git checkout -b feature/amazing-feature
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature
# Open a Pull Request
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA** and the ISS crew for inspiring humanity
- **Open Notify API** for free ISS data
- **OpenStreetMap** community for geocoding
- **CelesTrak** for TLE orbital elements
- **Globe.gl** and **MapLibre** teams for visualization tools

---

<p align="center">
  <strong>Made with ❤️ for space enthusiasts</strong><br>
  <sub>Version 1.0.0 | December 2025</sub>
</p>
