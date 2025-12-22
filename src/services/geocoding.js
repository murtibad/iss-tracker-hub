// src/services/geocoding.js
// Nominatim (OpenStreetMap) Geocoding Service

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "ISS-Tracker-HUB/1.0";

// Debounce helper
let searchTimeout = null;

/**
 * Search for addresses using Nominatim
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of search results
 */
export async function searchAddress(query) {
    if (!query || query.length < 3) {
        return [];
    }

    const url = new URL(`${NOMINATIM_BASE}/search`);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "5");

    try {
        const response = await fetch(url.toString(), {
            headers: {
                "User-Agent": USER_AGENT
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim error: ${response.status}`);
        }

        const data = await response.json();

        return data.map(result => ({
            displayName: result.display_name,
            lat: parseFloat(result.lat),
            lon: parseFloat(result.lon),
            address: result.address || {},
            type: result.type,
            importance: result.importance
        }));
    } catch (error) {
        console.error("Address search error:", error);
        return [];
    }
}

/**
 * Debounced address search
 * @param {string} query - Search query
 * @param {Function} callback - Callback with results
 * @param {number} delay - Debounce delay in ms
 */
export function debouncedSearch(query, callback, delay = 600) {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(async () => {
        const results = await searchAddress(query);
        callback(results);
    }, delay);
}

/**
 * Reverse geocode (coordinates to address)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Address information
 */
export async function reverseGeocode(lat, lon) {
    const url = new URL(`${NOMINATIM_BASE}/reverse`);
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("lon", lon.toString());
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");

    try {
        const response = await fetch(url.toString(), {
            headers: {
                "User-Agent": USER_AGENT
            }
        });

        if (!response.ok) {
            throw new Error(`Reverse geocode error: ${response.status}`);
        }

        const data = await response.json();

        return {
            displayName: data.display_name,
            address: data.address || {},
            lat,
            lon
        };
    } catch (error) {
        console.error("Reverse geocode error:", error);
        return {
            displayName: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
            address: {},
            lat,
            lon
        };
    }
}

/**
 * Get user location using browser geolocation
 * @returns {Promise<{lat: number, lon: number}>}
 */
export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes cache
            }
        );
    });
}
