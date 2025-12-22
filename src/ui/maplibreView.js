// src/ui/maplibreView.js
// MapLibre GL JS implementation for ISS Tracker Hub
// Dark Matter theme with Electric Blue ISS marker

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

/**
 * Create MapLibre map view with Dark Matter style
 * @param {HTMLElement} container - Map container element
 * @param {Object} options - Map options
 * @returns {Object} Map instance and control methods
 */
export function createMapLibreView(container, options = {}) {
    const { center = [0, 0], zoom = 2 } = options;

    console.log('[MapLibre] 🗺️ Initialization started');
    console.log('[MapLibre] Container:', container);
    console.log('[MapLibre] Options:', { center, zoom });

    // MapTiler Dark Matter style URL
    const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;
    console.log('[MapLibre] API Key loaded:', MAPTILER_API_KEY ? `${MAPTILER_API_KEY.substring(0, 8)}...` : 'MISSING!');

    if (!MAPTILER_API_KEY) {
        console.error('[MapLibre] ❌ VITE_MAPTILER_API_KEY is not defined in .env!');
        return null;
    }

    const styleUrl = `https://api.maptiler.com/maps/darkmatter/style.json?key=${MAPTILER_API_KEY}`;
    console.log('[MapLibre] Style URL:', styleUrl);

    // Initialize map
    console.log('[MapLibre] Creating Map instance...');
    const map = new maplibregl.Map({
        container,
        style: styleUrl,
        center,
        zoom,
        pitch: 0, // 2D view initially
        bearing: 0,
        antialias: true, // Smooth edges
        attributionControl: true
    });

    console.log('[MapLibre] Map instance created:', map);

    // Trajectory layers initialized flag
    let trajectoryLayersReady = false;

    // Map load event - add trajectory layers
    map.on('load', () => {
        console.log('[MapLibre] ✅ Map loaded successfully!');

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
        map.addSource('trajectory-past', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] }
        });

        map.addLayer({
            id: 'trajectory-past-glow',
            type: 'line',
            source: 'trajectory-past',
            paint: {
                'line-color': '#00d4ff',
                'line-width': 10,
                'line-opacity': 0.5,
                'line-blur': 6
            }
        });

        map.addLayer({
            id: 'trajectory-past-line',
            type: 'line',
            source: 'trajectory-past',
            paint: {
                'line-color': '#00d4ff',  // Electric blue (PAST)
                'line-width': 4,
                'line-opacity': 1.0
            }
        });

        // Future trajectory source (orange dashed)
        map.addSource('trajectory-future', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] }
        });

        map.addLayer({
            id: 'trajectory-future-line',
            type: 'line',
            source: 'trajectory-future',
            paint: {
                'line-color': '#ffa500',  // Orange (FUTURE)
                'line-width': 4,
                'line-opacity': 0.9,
                'line-dasharray': [4, 4]  // Dashed
            }
        });

        trajectoryLayersReady = true;
        console.log('[MapLibre] 🛤️ Trajectory layers initialized');
    });

    map.on('error', (e) => {
        console.error('[MapLibre] ❌ Map error:', e);
    });

    // Customize attribution position
    map.addControl(new maplibregl.AttributionControl({
        compact: true
    }), 'bottom-right');

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
    markerEl.innerHTML = issSvg;
    markerEl.style.cursor = 'pointer';
    markerEl.style.filter = "drop-shadow(0 0 5px rgba(0,212,255,0.8))";
    markerEl.style.transition = 'transform 0.3s ease';

    // Pulse animation on hover
    markerEl.addEventListener('mouseenter', () => markerEl.style.transform = 'scale(1.2)');
    markerEl.addEventListener('mouseleave', () => markerEl.style.transform = 'scale(1)');

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

    return {
        map,
        issMarker,
        popup,
        updateHomeMarker, // Expose for boot.js

        /**
         * Update ISS position - queues update for next map render
         * @param {number} lat - Latitude
         * @param {number} lng - Longitude
         */
        updateISSPosition(lat, lng) {
            storedISSPos.lat = lat;
            storedISSPos.lng = lng;
            markerNeedsUpdate = true;
            // Trigger a repaint to ensure render event fires
            map.triggerRepaint();
        },

        /**
         * Pan map to location with smooth animation
         * @param {number} lat - Latitude
         * @param {number} lng - Longitude
         * @param {number} zoom - Zoom level (optional)
         */
        panTo(lat, lng, zoom = 4) {
            map.flyTo({
                center: [lng, lat],
                zoom,
                duration: 1500, // 1.5s animation
                essential: true
            });
        },

        /**
         * Set map view (2D or 3D pitch)
         * @param {string} mode - 'flat' or 'tilted'
         */
        setViewMode(mode) {
            if (mode === 'tilted') {
                map.easeTo({ pitch: 60, duration: 1000 });
            } else {
                map.easeTo({ pitch: 0, duration: 1000 });
            }
        },

        /**
         * Update trajectory lines on map
         * @param {Object} pastGeoJSON - GeoJSON for past trajectory
         * @param {Object} futureGeoJSON - GeoJSON for future trajectory
         */
        updateTrajectory(pastGeoJSON, futureGeoJSON) {
            if (!trajectoryLayersReady) {
                console.warn('[MapLibre] Trajectory layers not ready yet');
                // Queue update for when layers are ready
                map.once('load', () => {
                    this.updateTrajectory(pastGeoJSON, futureGeoJSON);
                });
                return;
            }

            try {
                const pastSource = map.getSource('trajectory-past');
                const futureSource = map.getSource('trajectory-future');

                if (pastSource && pastGeoJSON) {
                    pastSource.setData(pastGeoJSON);
                }

                if (futureSource && futureGeoJSON) {
                    futureSource.setData(futureGeoJSON);
                }

                console.log('[MapLibre] 🛤️ Trajectory updated');
            } catch (e) {
                console.error('[MapLibre] Trajectory update error:', e);
            }
        },

        /**
         * Check if trajectory layers are ready
         */
        isTrajectoryReady() {
            return trajectoryLayersReady;
        },

        /**
         * Clean up and destroy map
         */
        destroy() {
            popup.remove();
            issMarker.remove();
            map.remove();
        }
    };
}
