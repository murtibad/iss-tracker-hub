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

    // Map load event
    map.on('load', () => {
        console.log('[MapLibre] ✅ Map loaded successfully!');
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
    markerEl.style.transition = 'all 0.3s ease';

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

    return {
        map,
        issMarker,
        popup,

        /**
         * Update ISS position on map
         * @param {number} lat - Latitude
         * @param {number} lng - Longitude
         */
        updateISSPosition(lat, lng) {
            issMarker.setLngLat([lng, lat]);
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
         * Clean up and destroy map
         */
        destroy() {
            popup.remove();
            issMarker.remove();
            map.remove();
        }
    };
}
