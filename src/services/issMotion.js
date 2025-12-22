// src/services/issMotion.js
// ISS Smooth Motion System - 60fps Lerp Interpolation
// Eliminates jitter by interpolating between discrete API updates

import { fetchIssTelemetry } from './iss.js';

// === CONFIGURATION ===
const CONFIG = {
    smoothFactor: 0.06,      // Lerp speed (0.05-0.1 ideal)
    dataInterval: 3000,      // API fetch interval (ms)
    positionThreshold: 0.001 // Minimum movement threshold
};

// === STATE ===
let target = { lat: 0, lng: 0, alt: 408 };   // API target position
let current = { lat: 0, lng: 0, alt: 408 };  // Interpolated current position
let lastKnown = null;                         // Last successful API data
let isRunning = false;
let animationFrameId = null;
let dataIntervalId = null;

// Callbacks for view updates
let onPositionUpdate = null;  // Called every frame with interpolated position
let onDataReceived = null;    // Called when new API data arrives

/**
 * Longitude-aware lerp that handles antimeridian crossing
 */
function lerpLng(current, target, factor) {
    let delta = target - current;

    // Handle antimeridian crossing (shortest path)
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    let result = current + delta * factor;

    // Normalize to [-180, 180]
    if (result > 180) result -= 360;
    if (result < -180) result += 360;

    return result;
}

/**
 * Standard lerp for latitude and altitude
 */
function lerp(current, target, factor) {
    return current + (target - current) * factor;
}

/**
 * Data fetch loop (low frequency - every 3s)
 */
async function fetchDataLoop() {
    try {
        const data = await fetchIssTelemetry();

        if (data) {
            // Update target position
            target.lat = data.lat;
            target.lng = data.lon;
            target.alt = data.altKm || 408;

            // First data? Jump to position immediately
            if (!lastKnown) {
                current.lat = target.lat;
                current.lng = target.lng;
                current.alt = target.alt;
            }

            lastKnown = { ...data };

            // Notify data callback
            if (onDataReceived) {
                onDataReceived(data);
            }

            console.log(`[Motion] 📡 Target updated: ${target.lat.toFixed(4)}, ${target.lng.toFixed(4)} [${data.source}]`);
        } else {
            console.warn('[Motion] ⚠️ No data received, keeping last position');
        }
    } catch (e) {
        console.error('[Motion] Data fetch error:', e);
    }
}

/**
 * Render loop (high frequency - 60fps)
 * Smoothly interpolates current position toward target
 */
function renderLoop() {
    if (!isRunning) return;

    // Lerp toward target
    const prevLat = current.lat;
    const prevLng = current.lng;

    current.lat = lerp(current.lat, target.lat, CONFIG.smoothFactor);
    current.lng = lerpLng(current.lng, target.lng, CONFIG.smoothFactor);
    current.alt = lerp(current.alt, target.alt, CONFIG.smoothFactor);

    // Only trigger update if position changed significantly
    const moved = Math.abs(current.lat - prevLat) > CONFIG.positionThreshold ||
        Math.abs(current.lng - prevLng) > CONFIG.positionThreshold;

    if (moved && onPositionUpdate) {
        onPositionUpdate({
            lat: current.lat,
            lng: current.lng,
            alt: current.alt
        });
    }

    animationFrameId = requestAnimationFrame(renderLoop);
}

/**
 * Start the motion system
 * @param {Object} options
 * @param {Function} options.onPosition - Called every frame with {lat, lng, alt}
 * @param {Function} options.onData - Called when new API data arrives
 */
export function startMotion({ onPosition, onData } = {}) {
    if (isRunning) {
        console.warn('[Motion] Already running');
        return;
    }

    onPositionUpdate = onPosition || null;
    onDataReceived = onData || null;
    isRunning = true;

    console.log('[Motion] 🚀 Starting ISS motion system');
    console.log(`[Motion] Config: smoothFactor=${CONFIG.smoothFactor}, interval=${CONFIG.dataInterval}ms`);

    // Initial data fetch
    fetchDataLoop();

    // Start data loop
    dataIntervalId = setInterval(fetchDataLoop, CONFIG.dataInterval);

    // Start render loop
    animationFrameId = requestAnimationFrame(renderLoop);
}

/**
 * Stop the motion system
 */
export function stopMotion() {
    isRunning = false;

    if (dataIntervalId) {
        clearInterval(dataIntervalId);
        dataIntervalId = null;
    }

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    console.log('[Motion] ⏹️ Motion system stopped');
}

/**
 * Get current interpolated position
 */
export function getCurrentPosition() {
    return { ...current };
}

/**
 * Get target position (from last API)
 */
export function getTargetPosition() {
    return { ...target };
}

/**
 * Get last known API data
 */
export function getLastKnownData() {
    return lastKnown ? { ...lastKnown } : null;
}

/**
 * Manually set target (for testing or prediction)
 */
export function setTarget(lat, lng, alt = 408) {
    target.lat = lat;
    target.lng = lng;
    target.alt = alt;
}

/**
 * Update config
 */
export function updateConfig(newConfig) {
    Object.assign(CONFIG, newConfig);
    console.log('[Motion] Config updated:', CONFIG);
}

// Export config for reference
export { CONFIG };
