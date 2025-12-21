// src/services/astronauts.js
// Wikipedia API integration for detailed astronaut information

/**
 * Fetch detailed astronaut info from Wikipedia
 * @param {string} name - Astronaut full name
 * @returns {Promise<Object>} Astronaut details
 */
export async function fetchAstronautDetails(name) {
    try {
        // Wikipedia REST API
        const encodedName = encodeURIComponent(name);
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedName}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Wikipedia API error: ${response.status}`);
        }

        const data = await response.json();

        return {
            name: data.title || name,
            thumbnail: data.thumbnail?.source || null,
            extract: data.extract || "No information available",
            description: data.description || "Astronaut",
            wikiUrl: data.content_urls?.desktop?.page || null,
            // Parse for additional info if available
            lang: data.lang || "en"
        };
    } catch (error) {
        console.warn(`Failed to fetch details for ${name}:`, error);
        return {
            name,
            thumbnail: null,
            extract: "Information not available",
            description: "ISS Crew Member",
            wikiUrl: null
        };
    }
}

/**
 * Fetch detailed info for multiple astronauts
 * @param {Array<{name: string, craft: string}>} crew - Crew members
 * @returns {Promise<Array>} Enhanced crew data
 */
export async function enhanceCrewData(crew) {
    const promises = crew.map(async (member) => {
        const details = await fetchAstronautDetails(member.name);
        return {
            ...member,
            ...details
        };
    });

    return Promise.all(promises);
}

/**
 * Calculate days in space (placeholder - would need launch date)
 * @param {string} name - Astronaut name
 * @returns {number|null} Days in space or null
 */
export function calculateDaysInSpace(name) {
    // This would require a database of launch dates
    // For now, return null
    // Could be enhanced with additional API or static data
    return null;
}
