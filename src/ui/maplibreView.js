// src/ui/maplibreView.js
// MapLibre GL JS implementation for ISS Tracker Hub
// Dark Matter theme with Electric Blue ISS marker

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { themeManager } from '../services/themeManager.js';

/**
 * Create MapLibre map view with Dark Matter style
 * @param {HTMLElement} container - Map container element
 * @param {Object} options - Map options
 * @returns {Object} Map instance and control methods
 */
export function createMapLibreView(container, options = {}) {
    const { center = [0, 0], zoom = 2, onUserInteraction } = options;

    console.log('[MapLibre] 🗺️ Initialization started');
    console.log('[MapLibre] Container:', container);
    console.log('[MapLibre] Options:', { center, zoom });

    // MapTiler styles - theme aware
    const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;
    console.log('[MapLibre] API Key:', MAPTILER_API_KEY ? 'Loaded ✓' : 'MISSING!');

    if (!MAPTILER_API_KEY) {
        console.error('[MapLibre] ❌ VITE_MAPTILER_API_KEY is not defined in .env!');
        return null;
    }

    // Theme-aware style selection
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const darkStyle = `https://api.maptiler.com/maps/darkmatter/style.json?key=${MAPTILER_API_KEY}`;
    const lightStyle = `https://api.maptiler.com/maps/positron/style.json?key=${MAPTILER_API_KEY}`;
    const styleUrl = isLight ? lightStyle : darkStyle;
    console.log('[MapLibre] Style:', isLight ? 'Light (Positron)' : 'Dark (Darkmatter)');

    // Initialize map
    console.log('[MapLibre] Creating Map instance...');
    const map = new maplibregl.Map({
        container,
        style: styleUrl,
        center,
        zoom,
        pitch: 0,
        bearing: 0,
        antialias: true,
        attributionControl: true // Keep for license compliance (styled via CSS)
    });

    // Detect user interaction to pause auto-follow
    // Only pan/drag should pause follow, not zoom
    if (onUserInteraction) {
        ['dragstart', 'touchstart'].forEach(event => {
            map.on(event, () => {
                onUserInteraction('pan');
            });
        });
    }

    // Track current style mode
    let currentStyleMode = isLight ? 'light' : 'dark';

    // Connect to ThemeManager
    themeManager.onThemeChange((state) => {
        const { effectiveTheme } = state;
        const newIsLight = effectiveTheme === 'light';
        const newStyle = newIsLight ? lightStyle : darkStyle;

        if (effectiveTheme !== currentStyleMode) {
            console.log(`[MapLibre] Switching map style to ${effectiveTheme}`);
            map.setStyle(newStyle);
            currentStyleMode = effectiveTheme;

            // Restore layers after style load
            map.once('styledata', () => {
                setupTrajectoryLayers(state);
            });
        } else {
            // Only palette changed, update colors immediately
            setupTrajectoryLayers(state);
        }
    });

    console.log('[MapLibre] Map instance created:', map);

    // Trajectory layers initialized flag
    let trajectoryLayersReady = false;

    // Define setup function to be reused on style changes
    const setupTrajectoryLayers = (themeState) => {
        // Resolve current theme state
        const state = themeState || themeManager.getCurrentTheme();
        const { effectiveTheme, paletteData } = state;
        const isLight = effectiveTheme === 'light';

        // Colors based on palette (Site Color)
        // If palette is set, use accent colors. Fallback to default Logic for safety.
        // Past = Accent (e.g. Neon Cyan, Green, Purple)
        // Future = Secondary Accent (Dashed)
        const paColor = paletteData ? paletteData.accent : (isLight ? '#0066cc' : '#00d4ff');
        const fuColor = paletteData ? paletteData.accentSecondary : (isLight ? '#e65100' : '#ffa500');

        console.log(`[MapLibre] 🎨 Updating trajectory colors: Past=${paColor}, Future=${fuColor}`);

        if (map.getSource('trajectory-past')) {
            // If layers exist, just update properties (efficient)
            if (map.getLayer('trajectory-past-line')) {
                map.setPaintProperty('trajectory-past-line', 'line-color', paColor);
                map.setPaintProperty('trajectory-past-glow', 'line-color', paColor);
                if (map.getLayer('trajectory-past-glow')) {
                    map.setPaintProperty('trajectory-past-glow', 'line-opacity', isLight ? 0.3 : 0.5);
                }
            }
            if (map.getLayer('trajectory-future-line')) {
                map.setPaintProperty('trajectory-future-line', 'line-color', fuColor);
            }
            // We return here if layers already exist to avoid re-creation error
            // BUT we must check if source needs data restore? No, setPaintProperty preserves data.
            // Check if arrow sources need restore? (Only on style change they get wiped)
            // If map.style changed (new style), layers are gone.
            // MapLibre .getLayer returns null if layer is gone.

            // If layers are present, we are done with color update.
            // If layers are present, we still need to update arrow images and restart animation
            // so we continue execution instead of returning.

        }

        console.log('[MapLibre] 🔄 Setting up trajectory layers...');

        // Find the first symbol layer to place trajectory below labels
        const layers = map.getStyle().layers;
        let firstSymbolId;
        for (const layer of layers) {
            if (layer.type === 'symbol') {
                firstSymbolId = layer.id;
                break;
            }
        }
        console.log('[MapLibre] Placing trajectory below layer:', firstSymbolId);

        // Past trajectory source (cyan)
        if (!map.getSource('trajectory-past')) {
            map.addSource('trajectory-past', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
        }

        if (!map.getLayer('trajectory-past-glow')) {
            map.addLayer({
                id: 'trajectory-past-glow',
                type: 'line',
                source: 'trajectory-past',
                paint: {
                    'line-color': paColor,
                    'line-width': 10,
                    'line-opacity': isLight ? 0.3 : 0.5,
                    'line-blur': 6
                }
            }, firstSymbolId);
        }

        if (!map.getLayer('trajectory-past-line')) {
            map.addLayer({
                id: 'trajectory-past-line',
                type: 'line',
                source: 'trajectory-past',
                paint: {
                    'line-color': paColor,
                    'line-width': 4,
                    'line-opacity': 1.0
                }
            }, firstSymbolId);
        }

        // Future trajectory source (orange dashed)
        if (!map.getSource('trajectory-future')) {
            map.addSource('trajectory-future', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
        }

        if (!map.getLayer('trajectory-future-line')) {
            map.addLayer({
                id: 'trajectory-future-line',
                type: 'line',
                source: 'trajectory-future',
                paint: {
                    'line-color': fuColor,
                    'line-width': 4,
                    'line-opacity': 0.9,
                    'line-dasharray': [4, 4]  // Dashed
                }
            }, firstSymbolId);
        }

        // --- ANIMATED ARROWS ---
        if (!map.getSource('arrows-future-source')) {
            map.addSource('arrows-future-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        }
        if (!map.getLayer('arrows-future-layer')) {
            map.addLayer({
                id: 'arrows-future-layer',
                type: 'symbol',
                source: 'arrows-future-source',
                layout: {
                    'icon-image': 'arrow-future',
                    'icon-size': 0.85,
                    'icon-rotate': ['get', 'rotation'],
                    'icon-rotation-alignment': 'map',
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': true
                },
                paint: { 'icon-opacity': 1 }
            });
        }

        if (!map.getSource('arrows-past-source')) {
            map.addSource('arrows-past-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        }
        if (!map.getLayer('arrows-past-layer')) {
            map.addLayer({
                id: 'arrows-past-layer',
                type: 'symbol',
                source: 'arrows-past-source',
                layout: {
                    'icon-image': 'arrow-past',
                    'icon-size': 0.85,
                    'icon-rotate': ['get', 'rotation'],
                    'icon-rotation-alignment': 'map',
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': true
                },
                paint: { 'icon-opacity': 1 }
            });
        }

        // Dynamic SVG Arrows based on Theme
        const createArrowSvg = (color) => `
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l-8 14h16z" fill="${color}" stroke="rgba(0,0,0,0.5)" stroke-width="2" stroke-linejoin="round"/>
        </svg>`;

        const loadArrow = (name, color) => {
            const svg = createArrowSvg(color);
            const img = new Image(24, 24);
            img.onload = () => {
                // If image exists, remove it first to force update
                if (map.hasImage(name)) map.removeImage(name);
                map.addImage(name, img);
            };
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        };

        // Load specific colors
        loadArrow('arrow-future', fuColor);
        loadArrow('arrow-past', paColor);



        // Restore Data if available in cache
        if (trajectoryCoords.past && trajectoryCoords.past.length > 0) {
            // trajectoryCoords.past is expected to be array of points [[lng,lat], ...]
            const geojson = { type: 'Feature', geometry: { type: 'LineString', coordinates: trajectoryCoords.past } };
            map.getSource('trajectory-past').setData(fixMeridianCrossing(geojson));
        }
        if (trajectoryCoords.future && trajectoryCoords.future.length > 0) {
            const geojson = { type: 'Feature', geometry: { type: 'LineString', coordinates: trajectoryCoords.future } };
            map.getSource('trajectory-future').setData(fixMeridianCrossing(geojson));
        }

        // Restart animation
        startArrowAnimation();

        trajectoryLayersReady = true;
        console.log('[MapLibre] 🛤️ Trajectory layers initialized');
    };

    // Map load event - add trajectory layers
    map.on('load', () => {
        console.log('[MapLibre] ✅ Map loaded successfully!');
        setupTrajectoryLayers();
    });

    map.on('error', (e) => {
        console.error('[MapLibre] ❌ Map error:', e);
    });

    // Attribution control disabled (MapTiler/OSM credits hidden)
    // map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    // Add navigation controls (zoom, compass)
    map.addControl(new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: false
    }), 'top-right');

    // --- MARKERS ---

    // 1. ISS Marker (Pixel Art Style)
    // Custom SVG string for Pixel Art ISS
    const issSvg = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 18H26V22H14V18Z" fill="#00D4FF"/>
        <path d="M12 16H8V24H12V16Z" fill="#66E0FF"/>
        <path d="M28 16H32V24H28V16Z" fill="#66E0FF"/>
        <path d="M18 14V10H22V14H18Z" fill="#0099CC"/>
        <path d="M18 26V30H22V26H18Z" fill="#0099CC"/>
        <path d="M4 14H8V26H4V14Z" fill="#AACCFF"/> 
        <path d="M32 14H36V26H32V14Z" fill="#AACCFF"/>
        <rect x="0" y="14" width="4" height="12" fill="#003366"/>
        <rect x="36" y="14" width="4" height="12" fill="#003366"/>
        <rect x="19" y="8" width="2" height="2" fill="white"/> <!-- Antenna tip -->
    </svg>
    `;

    const markerEl = document.createElement('div');
    markerEl.className = 'iss-marker';
    markerEl.style.width = '40px';
    markerEl.style.height = '40px';
    markerEl.style.cursor = 'pointer';

    // Create an inner container for the graphic to handle scaling/animations
    // independent of the map positioning (which uses transform on the parent)
    const innerEl = document.createElement('div');
    innerEl.style.width = '100%';
    innerEl.style.height = '100%';
    innerEl.innerHTML = issSvg;
    // Filter handled by parent CSS class .iss-marker (animation)
    innerEl.style.transition = 'transform 0.3s ease';

    markerEl.appendChild(innerEl);

    // Pulse animation on hover - apply to inner element
    markerEl.addEventListener('mouseenter', () => innerEl.style.transform = 'scale(1.2)');
    markerEl.addEventListener('mouseleave', () => innerEl.style.transform = 'scale(1)');

    const issMarker = new maplibregl.Marker({
        element: markerEl,
        anchor: 'center'
    })
        .setLngLat([0, 0])
        .addTo(map);

    // 2. User Home Marker (Custom Base Logo)
    // Only created when location is set, handled via custom method or externally?
    // Let's add method to update Home Marker
    let homeMarker = null;

    function updateHomeMarker(lat, lng) {
        if (!homeMarker) {
            const el = document.createElement('div');
            el.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9.5L12 2.5L21 9.5V20.5C21 21.0523 20.5523 21.5 20 21.5H15V15.5H9V21.5H4C3.44772 21.5 3 21.0523 3 20.5V9.5Z" fill="#FF00FF" stroke="white" stroke-width="2"/>
            </svg>`;
            el.className = 'home-marker';
            el.style.filter = "drop-shadow(0 0 5px #ff00ff)";

            homeMarker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
                .setLngLat([lng, lat])
                .addTo(map);
        } else {
            homeMarker.setLngLat([lng, lat]);
        }
    }

    // Popup for ISS info
    const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25
    });

    markerEl.addEventListener('click', () => {
        const [lng, lat] = issMarker.getLngLat().toArray();
        popup
            .setLngLat([lng, lat])
            .setHTML(`
        <div style="
          background: var(--card);
          color: var(--text);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
        ">
          <strong>🛰️ ISS Position</strong><br>
          Lat: ${lat.toFixed(4)}°<br>
          Lng: ${lng.toFixed(4)}°
        </div>
      `)
            .addTo(map);
    });

    // --- Render-synced marker position ---
    // Stores position and marker updates on map render event (not every rAF)
    let storedISSPos = { lat: 0, lng: 0 };
    let markerNeedsUpdate = false;

    // Bind marker update to map render cycle for perfect camera sync
    map.on('render', () => {
        if (markerNeedsUpdate) {
            issMarker.setLngLat([storedISSPos.lng, storedISSPos.lat]);
            markerNeedsUpdate = false;
        }
    });

    // --- Animation State ---
    let arrowAnimationId = null;
    const ARROW_SPACING = 15.0; // Degrees between arrows
    const ARROW_SPEED = 0.005; // Degrees per ms (5 deg/sec)
    let trajectoryCoords = { past: [], future: [] };

    // --- Geometry Helpers ---
    function getDist(p1, p2) {
        return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
    }

    function getBearing(p1, p2) {
        const dLon = (p2[0] - p1[0]) * Math.PI / 180;
        const lat1 = p1[1] * Math.PI / 180;
        const lat2 = p2[1] * Math.PI / 180;
        const y2 = Math.sin(dLon) * Math.cos(lat2);
        const x2 = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        return Math.atan2(y2, x2) * 180 / Math.PI;
    }

    // Generate interpolated points along the path
    function generateArrowPoints(path, startOffset) {
        if (!path || path.length < 2) return [];

        const points = [];
        const segLens = [];

        // Pre-calc segment lengths
        for (let i = 0; i < path.length - 1; i++) {
            // Check for potential antimeridian jump (gap > 180 deg)
            const dLon = Math.abs(path[i][0] - path[i + 1][0]);
            if (dLon > 180) {
                segLens.push(0); // Skip drawing across world wrap
            } else {
                const d = getDist(path[i], path[i + 1]);
                segLens.push(d);
            }
        }

        // Walk the path
        let pathDist = 0;

        // Easier approach: Accumulate distance, place arrow when milestone reached
        let nextArrowDist = startOffset;

        for (let i = 0; i < segLens.length; i++) {
            const segLen = segLens[i];
            if (segLen === 0) {
                pathDist += segLen; // Still advance pathDist even if segment is skipped
                continue;
            }

            const segStartDist = pathDist;
            const segEndDist = pathDist + segLen;

            // While the next arrow falls within this segment
            while (nextArrowDist < segEndDist) {
                const fraction = (nextArrowDist - segStartDist) / segLen;
                const p1 = path[i];
                const p2 = path[i + 1];

                const lng = p1[0] + (p2[0] - p1[0]) * fraction;
                const lat = p1[1] + (p2[1] - p1[1]) * fraction;
                const bearing = getBearing(p1, p2);

                points.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [lng, lat] },
                    properties: { rotation: bearing }
                });

                nextArrowDist += ARROW_SPACING;
            }
            pathDist += segLen;
        }
        return points;
    }

    function startArrowAnimation() {
        if (arrowAnimationId) cancelAnimationFrame(arrowAnimationId);

        const animate = () => {
            const now = Date.now();
            // Constant speed phase shift: (time * speed) % spacing
            // We want them to flow AWAY from current time? Or just flow along line?
            // "Along line" means increasing distance index.
            // We want visual flow towards future -> increasing distance.
            // Phase goes 0 -> SPACING.
            const phase = (now * ARROW_SPEED) % ARROW_SPACING;

            // To make them look like they are travelling, we offset the start.
            // If we start at 'phase', the first arrow is at 'phase' distance.
            // As 'phase' increases, arrow moves further.
            // When 'phase' wraps to 0, a new arrow appears at start.
            // This is correct for forward motion.

            // Update Future Arrows (Orange)
            if (trajectoryCoords.future && trajectoryCoords.future.length > 0 && map.getSource('arrows-future-source')) {
                // Determine if we have one long line or multi segments
                // Simplified: Treat as one flat line, but generateArrowPoints handles jumps now
                const flatLine = Array.isArray(trajectoryCoords.future[0]) && typeof trajectoryCoords.future[0][0] === 'number'
                    ? trajectoryCoords.future
                    : trajectoryCoords.future.flat();

                map.getSource('arrows-future-source').setData({
                    type: 'FeatureCollection',
                    features: generateArrowPoints(flatLine, phase)
                });
            }

            // Update Past Arrows (Blue)
            if (trajectoryCoords.past && trajectoryCoords.past.length > 0 && map.getSource('arrows-past-source')) {
                const flatLine = Array.isArray(trajectoryCoords.past[0]) && typeof trajectoryCoords.past[0][0] === 'number'
                    ? trajectoryCoords.past
                    : trajectoryCoords.past.flat();

                map.getSource('arrows-past-source').setData({
                    type: 'FeatureCollection',
                    features: generateArrowPoints(flatLine, phase)
                });
            }

            arrowAnimationId = requestAnimationFrame(animate);
        };
        animate();
    }

    return {
        map,
        issMarker,
        popup,
        updateHomeMarker,

        updateISSPosition(lat, lng) {
            storedISSPos.lat = lat;
            storedISSPos.lng = lng;
            markerNeedsUpdate = true;
            map.triggerRepaint();
        },

        panTo(lat, lng, zoom = 4) {
            map.flyTo({ center: [lng, lat], zoom, duration: 1500, essential: true });
        },

        setViewMode(mode) {
            map.easeTo({ pitch: mode === 'tilted' ? 60 : 0, duration: 1000 });
        },

        updateTrajectory(pastGeoJSON, futureGeoJSON) {
            if (!trajectoryLayersReady) {
                map.once('load', () => this.updateTrajectory(pastGeoJSON, futureGeoJSON));
                return;
            }

            // Update lines (with dateline crossing fix)
            const pastSource = map.getSource('trajectory-past');
            const futureSource = map.getSource('trajectory-future');
            if (pastSource && pastGeoJSON) pastSource.setData(fixMeridianCrossing(pastGeoJSON));
            if (futureSource && futureGeoJSON) futureSource.setData(fixMeridianCrossing(futureGeoJSON));

            // Store raw coordinates for animation (extracting from MultiLineString or LineString)
            // Simplifying: Assume LineString or array of coordinates from the main feature
            // GeoJSON typically: { type: 'Feature', geometry: { type: 'LineString', coordinates: [...] } }
            if (futureGeoJSON && futureGeoJSON.geometry && futureGeoJSON.geometry.coordinates) {
                // Ensure purely flat array of [lng, lat]
                trajectoryCoords.future = futureGeoJSON.geometry.type === 'MultiLineString'
                    ? futureGeoJSON.geometry.coordinates.flat() // Merge segments if split by antimeridian
                    : futureGeoJSON.geometry.coordinates;
            }
            if (pastGeoJSON && pastGeoJSON.geometry && pastGeoJSON.geometry.coordinates) {
                trajectoryCoords.past = pastGeoJSON.geometry.type === 'MultiLineString'
                    ? pastGeoJSON.geometry.coordinates.flat()
                    : pastGeoJSON.geometry.coordinates;
            }

            // Init animation sources if needed
            if (!map.getSource('arrows-future-source')) {
                map.addSource('arrows-future-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
                map.addLayer({
                    id: 'arrows-future-layer',
                    type: 'symbol',
                    source: 'arrows-future-source',
                    layout: {
                        'icon-image': 'arrow-orange',
                        'icon-size': 0.85,
                        'icon-rotate': ['get', 'rotation'],
                        'icon-rotation-alignment': 'map',
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true
                    },
                    paint: { 'icon-opacity': 1 }
                });
                startArrowAnimation();
            }

            if (!map.getSource('arrows-past-source')) {
                map.addSource('arrows-past-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
                map.addLayer({
                    id: 'arrows-past-layer',
                    type: 'symbol',
                    source: 'arrows-past-source',
                    layout: {
                        'icon-image': 'arrow-blue',
                        'icon-size': 0.85,
                        'icon-rotate': ['get', 'rotation'],
                        'icon-rotation-alignment': 'map',
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true
                    },
                    paint: { 'icon-opacity': 1 }
                });
            }
        },

        isTrajectoryReady() { return trajectoryLayersReady; },

        destroy() {
            if (arrowAnimationId) cancelAnimationFrame(arrowAnimationId);
            popup.remove();
            issMarker.remove();
            map.remove();
        }
    };
}

/**
 * Splits LineString features into MultiLineStrings if they need to cross the 180th meridian.
 * This prevents the renderer from drawing a straight line across the entire map.
 * @param {Object} feature GeoJSON Feature or Geometry
 * @returns {Object} New GeoJSON Feature with potentially modified geometry
 */
function fixMeridianCrossing(feature) {
    if (!feature) return feature;

    // Handle pure geometry object
    if (feature.type === 'LineString' && Array.isArray(feature.coordinates)) {
        feature = { type: 'Feature', geometry: feature };
    }

    // Safely extract coordinates
    let coords = null;
    if (feature.geometry && feature.geometry.type === 'LineString') {
        coords = feature.geometry.coordinates;
    } else if (feature.type === 'Feature' && !feature.geometry) {
        // Maybe it has no geometry? Return as is.
        return feature;
    }

    // If we didn't find LineString coords, return original (it might be Point, MultiLineString already, etc.)
    if (!coords) return feature;

    const segments = [];
    let currentSegment = [];

    for (let i = 0; i < coords.length; i++) {
        const pt = coords[i];
        if (currentSegment.length > 0) {
            const prev = currentSegment[currentSegment.length - 1];
            // Check for longitude wrap (> 180 deg difference)
            if (Math.abs(pt[0] - prev[0]) > 180) {
                segments.push(currentSegment);
                currentSegment = [];
            }
        }
        currentSegment.push(pt);
    }
    if (currentSegment.length > 0) segments.push(currentSegment);

    // If only one segment, no wrap occurred
    if (segments.length === 1) return feature;

    return {
        type: 'Feature',
        properties: feature.properties || {},
        geometry: {
            type: 'MultiLineString',
            coordinates: segments
        }
    };
}
