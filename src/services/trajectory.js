// src/services/trajectory.js
// TR: ISS yörünge hesaplama servisi - SGP4 ile geçmiş ve gelecek pozisyonlar
// EN: ISS trajectory calculation service - past and future positions using SGP4

import * as satellite from 'satellite.js';
import { getIssTle } from './tle.js';

/**
 * Calculate ISS trajectory points using SGP4 propagation
 * @param {Object} options - Configuration options
 * @returns {Promise<{past: Array, future: Array, current: Object}>}
 */
export async function calculateTrajectory({
    pastMinutes = 45,    // ~half orbit behind
    futureMinutes = 90,  // ~1 full orbit ahead
    stepSeconds = 60     // 1 minute steps
} = {}) {
    const { line1, line2 } = await getIssTle();
    const satrec = satellite.twoline2satrec(line1, line2);

    const now = new Date();
    const pastPoints = [];
    const futurePoints = [];

    // Calculate PAST positions (going backwards)
    for (let i = pastMinutes * 60; i >= 0; i -= stepSeconds) {
        const time = new Date(now.getTime() - i * 1000);
        const pos = propagateToLatLng(satrec, time);
        if (pos) pastPoints.push(pos);
    }

    // Calculate FUTURE positions (~1 orbit = 92 minutes)
    for (let i = stepSeconds; i <= futureMinutes * 60; i += stepSeconds) {
        const time = new Date(now.getTime() + i * 1000);
        const pos = propagateToLatLng(satrec, time);
        if (pos) futurePoints.push(pos);
    }

    // Current position (now)
    const current = propagateToLatLng(satrec, now);

    console.log(`[Trajectory] Calculated: ${pastPoints.length} past, ${futurePoints.length} future points`);

    return {
        past: pastPoints,
        future: futurePoints,
        current
    };
}

/**
 * Propagate satellite position to get lat/lng for given time
 * @param {Object} satrec - Satellite record from TLE
 * @param {Date} time - Time to calculate position for
 * @returns {Object|null} Position object { lat, lng, alt, time }
 */
function propagateToLatLng(satrec, time) {
    try {
        const pv = satellite.propagate(satrec, time);
        if (!pv.position) return null;

        const gmst = satellite.gstime(time);
        const geodetic = satellite.eciToGeodetic(pv.position, gmst);

        // Convert radians to degrees
        const lat = satellite.degreesLat(geodetic.latitude);
        let lng = satellite.degreesLong(geodetic.longitude);

        // Normalize longitude to -180 to 180
        while (lng > 180) lng -= 360;
        while (lng < -180) lng += 360;

        return {
            lat,
            lng,
            alt: geodetic.height, // km
            time: time.getTime()
        };
    } catch (e) {
        console.warn('[Trajectory] Propagation error:', e);
        return null;
    }
}

/**
 * Split trajectory at antimeridian crossings for proper GeoJSON rendering
 * @param {Array} points - Array of {lat, lng} points
 * @returns {Array} Array of LineString coordinate arrays
 */
export function splitAtAntimeridian(points) {
    if (!points || points.length < 2) return [];

    const segments = [];
    let currentSegment = [[points[0].lng, points[0].lat]];

    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];

        // Check for antimeridian crossing (longitude jump > 180°)
        const lngDiff = Math.abs(curr.lng - prev.lng);

        if (lngDiff > 180) {
            // Start new segment
            if (currentSegment.length > 1) {
                segments.push(currentSegment);
            }
            currentSegment = [[curr.lng, curr.lat]];
        } else {
            currentSegment.push([curr.lng, curr.lat]);
        }
    }

    // Add final segment
    if (currentSegment.length > 1) {
        segments.push(currentSegment);
    }

    return segments;
}

/**
 * Convert trajectory points to GeoJSON MultiLineString
 * @param {Array} points - Array of {lat, lng} points
 * @returns {Object} GeoJSON Feature
 */
export function trajectoryToGeoJSON(points) {
    const segments = splitAtAntimeridian(points);

    if (segments.length === 0) {
        return {
            type: 'Feature',
            geometry: { type: 'MultiLineString', coordinates: [] }
        };
    }

    if (segments.length === 1) {
        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: segments[0]
            }
        };
    }

    return {
        type: 'Feature',
        geometry: {
            type: 'MultiLineString',
            coordinates: segments
        }
    };
}
