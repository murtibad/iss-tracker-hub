# Changelog

All notable changes to ISS Tracker Hub will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-25

### 🎉 Initial Production Release

This release marks the first stable version of ISS Tracker Hub, featuring comprehensive
refactoring, security fixes, and professional-grade documentation.

### Session 2 Changes (Dec 25, 2025)

#### Fixed
- **3D Trajectory Lines** - Fixed antimeridian crossing issue causing chaotic lines
- **2D ISS Marker** - Added z-index fixes for MapLibre marker visibility
- **NASA Live Streams** - Updated YouTube video IDs to current working streams

#### Added
- **Intro Animation** (`src/ui/intro.js`) - Premium loading screen on first visit
- **Motion Utilities** (`src/utils/motionUtils.js`) - Reusable animation helpers
- **Temporary Follow Pause** - Globe can be interacted with, resumes follow after 5s
- **Locked Languages** - Settings shows unavailable languages with "Coming Soon"

#### Improved
- **Stars Rendering** - Much larger sphere (5000 units) for realistic look at any zoom
- **Button Micro-interactions** - Hover scale and active press effects
- **Scroll Reveal animations** - CSS classes for staggered entrance animations

### Added
- **Centralized Utilities** (`src/utils/utils.js`)
  - Common helper functions (fmtNum, fmtInt, pad2, fmtHMS)
  - Coordinate utilities (clampLat, normalizeLon, haversineDistance)
  - Safe localStorage wrapper with error handling
  - Debounce and throttle functions
  - DOM builder helper (buildEl)

- **Expanded Configuration** (`src/constants/config.js`)
  - Centralized API endpoints
  - ISS constants (NORAD ID, orbital parameters)
  - Globe and Map settings
  - UI timing configuration
  - Storage key management
  - Frozen config objects for immutability

- **Animation System** (`src/styles/animations.css`)
  - View mode transitions (2D ↔ 3D fade)
  - ISS marker pulse animation
  - Loading spinners (spinner, dots, skeleton)
  - Modal slide animations
  - Toast notification transitions
  - Reduced motion media query support (A11y)

- **Dynamic Crew Fetching** (`src/services/crew.js`)
  - Live crew data from Open Notify API
  - Agency detection heuristics
  - Fallback to static data for offline mode

- **ESLint Configuration** (`.eslintrc.json`)
  - Code style enforcement
  - ES2022 module support
  - Sensible rule defaults

- **Comprehensive README**
  - Feature table
  - Quick start guide
  - Tech stack documentation
  - Project structure diagram
  - Configuration instructions
  - PWA capabilities explanation

### Changed
- **Updated Dependencies**
  - Vite: 5.4.0 → 6.2.0 (security fix for esbuild vulnerability)
  - date-fns: 2.30.0 → 4.1.0 (major version upgrade)
  - Added ESLint 8.57.0

- **Security Improvements**
  - Changed Open Notify API from HTTP to HTTPS
  - Removed API key exposure from console logs
  - Enhanced .gitignore with security patterns

- **i18n Enhancements**
  - Added missing translation keys (nasaNote, skinRealistic, skinLiquid, skinCyberpunk)
  - Both TR and EN dictionaries updated

### Fixed
- **Duplicate startMotion() Call** in boot.js
  - Motion system was being initialized twice, causing potential performance issues
  - Removed duplicate call, keeping the more comprehensive instance

- **Hardcoded Turkish Strings**
  - NASA note text now uses i18n system with fallback

### Security
- CVE-2024-XXXX: esbuild development server vulnerability mitigated by Vite 6.x upgrade
- API keys no longer partially exposed in browser console

---

## [0.3.3] - 2025-12-15

### Added
- Mobile bottom navigation bar
- GitHub Pages compatibility fixes
- Network status indicators
- Landing hero component

### Changed
- 3D Globe singleton pattern improvements
- Pass card redesign

---

## [0.3.2] - 2025-12-10

### Added
- PWA Phase 2: Runtime caching with Workbox
- Offline/stale data indicators

---

## [0.3.1] - 2025-12-05

### Added
- i18n Phase 2: Full TR/EN translation
- Smart unit conversion (km/h for TR, mph for EN)

---

## [0.3.0] - 2025-12-01

### Added
- 3D Globe visualization with Globe.gl
- SGP4 pass prediction calculations
- Weather integration (Open-Meteo)

---

## [0.2.0] - 2025-11-15

### Added
- MapLibre GL integration
- Real-time ISS tracking
- 3-tier API fallback system

---

## [0.1.0] - 2025-11-01

### Added
- Initial project setup
- Basic HTML/CSS/JS structure
- Vite build system
