// src/services/crew.js
// Dynamic crew data fetching from Open Notify API
// With static fallback for offline mode

const CREW_API = "https://api.open-notify.org/astros.json";

// Static fallback crew data (updated periodically)
const FALLBACK_CREW = [
  {
    id: "oleg_kononenko",
    name: "Oleg Kononenko",
    agency: "Roscosmos",
    role: "Commander",
    wiki: "https://en.wikipedia.org/wiki/Oleg_Kononenko",
  },
  {
    id: "nikolai_chub",
    name: "Nikolai Chub",
    agency: "Roscosmos",
    role: "Flight Engineer",
    wiki: "https://en.wikipedia.org/wiki/Nikolai_Chub",
  },
  {
    id: "tracy_dyson",
    name: "Tracy C. Dyson",
    agency: "NASA",
    role: "Flight Engineer",
    wiki: "https://en.wikipedia.org/wiki/Tracy_Caldwell_Dyson",
  },
  {
    id: "matthew_dominick",
    name: "Matthew Dominick",
    agency: "NASA",
    role: "Flight Engineer",
    wiki: "https://en.wikipedia.org/wiki/Matthew_Dominick",
  },
  {
    id: "michael_barratt",
    name: "Michael Barratt",
    agency: "NASA",
    role: "Flight Engineer",
    wiki: "https://en.wikipedia.org/wiki/Michael_Barratt_(astronaut)",
  },
  {
    id: "jeanette_epps",
    name: "Jeanette Epps",
    agency: "NASA",
    role: "Flight Engineer",
    wiki: "https://en.wikipedia.org/wiki/Jeanette_Epps",
  },
  {
    id: "alexander_grebenkin",
    name: "Alexander Grebenkin",
    agency: "Roscosmos",
    role: "Flight Engineer",
    wiki: "https://en.wikipedia.org/wiki/Alexander_Grebenkin",
  },
];

// Agency detection from name patterns (heuristic)
function detectAgency(name) {
  const russianPatterns = ['ov', 'ev', 'ko', 'in', 'kin', 'chuk', 'enko'];
  const lastPart = name.split(' ').pop().toLowerCase();

  for (const pattern of russianPatterns) {
    if (lastPart.endsWith(pattern)) {
      return 'Roscosmos';
    }
  }

  // Default to NASA for others (simplified)
  return 'NASA';
}

/**
 * Fetch current ISS crew from Open Notify API
 * @returns {Promise<Array>} Array of crew members
 */
export async function fetchCurrentCrew() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(CREW_API, {
      signal: controller.signal,
      cache: "no-store"
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.message !== 'success') {
      throw new Error('API returned failure');
    }

    // Filter ISS crew only
    const issCrew = data.people
      .filter(p => p.craft === "ISS")
      .map((p, index) => ({
        id: p.name.toLowerCase().replace(/\s+/g, '_'),
        name: p.name,
        craft: p.craft,
        agency: detectAgency(p.name),
        role: index === 0 ? "Commander" : "Flight Engineer",
        wiki: `https://en.wikipedia.org/wiki/${encodeURIComponent(p.name.replace(/\s+/g, '_'))}`,
      }));

    console.log(`[Crew] ✅ Fetched ${issCrew.length} ISS crew members`);
    return issCrew;

  } catch (error) {
    console.warn('[Crew] ⚠️ API failed, using fallback:', error.message);
    return FALLBACK_CREW;
  }
}

/**
 * Get total people in space (all crafts)
 * @returns {Promise<Object>} { total: number, crafts: Array }
 */
export async function fetchPeopleInSpace() {
  try {
    const response = await fetch(CREW_API, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    // Group by craft
    const crafts = {};
    data.people.forEach(p => {
      if (!crafts[p.craft]) {
        crafts[p.craft] = [];
      }
      crafts[p.craft].push(p.name);
    });

    return {
      total: data.number,
      crafts: Object.entries(crafts).map(([name, crew]) => ({
        name,
        count: crew.length,
        crew
      }))
    };
  } catch (error) {
    console.warn('[Crew] People in space fetch failed:', error);
    return {
      total: FALLBACK_CREW.length,
      crafts: [{ name: 'ISS', count: FALLBACK_CREW.length, crew: FALLBACK_CREW.map(c => c.name) }]
    };
  }
}

// Legacy export for backward compatibility
export const CREW = FALLBACK_CREW;
