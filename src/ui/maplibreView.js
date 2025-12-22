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
                'line-width': 8,
                'line-opacity': 0.4,
                'line-blur': 4
            }
        }, firstSymbolId);

        map.addLayer({
            id: 'trajectory-past-line',
            type: 'line',
            source: 'trajectory-past',
            paint: {
                'line-color': '#00d4ff',  // Electric blue (PAST)
                'line-width': 3,
                'line-opacity': 1.0
            }
        }, firstSymbolId);

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
                'line-width': 3,
                'line-opacity': 0.8,
                'line-dasharray': [6, 4]  // Dashed
            }
        }, firstSymbolId);

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

    // Create ISS marker element with radar glow effect
    const markerEl = document.createElement('div');
    markerEl.className = 'iss-marker';
    markerEl.style.width = '16px';
    markerEl.style.height = '16px';
    markerEl.style.backgroundColor = '#00d4ff'; // Electric blue
    markerEl.style.border = '2px solid #00d4ff';
    markerEl.style.borderRadius = '50%';
    markerEl.style.boxShadow = `
    0 0 10px #00d4ff,
    0 0 20px #00d4ff,
    0 0 30px rgba(0, 212, 255, 0.5)
  `; // Radar glow effect
    markerEl.style.cursor = 'pointer';
    // NO transition on transform - prevents swimming during pan!
    // Only transition box-shadow for hover effect
    markerEl.style.transition = 'box-shadow 0.3s ease';
    // GPU acceleration hint
    markerEl.style.willChange = 'transform';

    // Pulse animation on hover
    markerEl.addEventListener('mouseenter', () => {
        markerEl.style.transform = 'scale(1.3)';
        markerEl.style.boxShadow = `
      0 0 15px #00d4ff,
      0 0 30px #00d4ff,
      0 0 45px rgba(0, 212, 255, 0.7)
    `;
    });

    markerEl.addEventListener('mouseleave', () => {
        markerEl.style.transform = 'scale(1)';
        markerEl.style.boxShadow = `
      0 0 10px #00d4ff,
      0 0 20px #00d4ff,
      0 0 30px rgba(0, 212, 255, 0.5)
    `;
    });

    // Create ISS marker
    const issMarker = new maplibregl.Marker({
        element: markerEl,
        anchor: 'center'
    })
        .setLngLat([0, 0])
        .addTo(map);

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
