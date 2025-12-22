import { t } from "../../i18n/i18n.js";
import { ICONS } from "../icons.js";

// Mock Crew Data (based on typical Expedition composition)
// Photos from NASA/Wikicommons (using public placeholders or reliable URLs if available, using generated placeholders here for safety/reliability)
const CREW = [
    {
        name: "Oleg Kononenko",
        country: "ru",
        roleKey: "bioCdr",
        days: 200,
        photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Oleg_Kononenko_v2.jpg/480px-Oleg_Kononenko_v2.jpg",
        bio: "Veteran cosmonaut and commander of the station."
    },
    {
        name: "Nikolai Chub",
        country: "ru",
        roleKey: "bioFe",
        days: 200,
        photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Nikolai_Chub_official_portrait.jpg/480px-Nikolai_Chub_official_portrait.jpg",
        bio: "Flight engineer on his first long-duration mission."
    },
    {
        name: "Loral O'Hara",
        country: "us",
        roleKey: "bioFe",
        days: 170,
        photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Loral_O%27Hara_official_portrait.jpg/480px-Loral_O%27Hara_official_portrait.jpg",
        bio: "Researching microgravity fluid dynamics."
    },
    {
        name: "Matthew Dominick",
        country: "us",
        roleKey: "bioFe",
        days: 25,
        photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Matthew_Dominick_official_portrait.jpg/480px-Matthew_Dominick_official_portrait.jpg",
        bio: "US Navy test pilot and NASA astronaut."
    },
    {
        name: "Michael Barratt",
        country: "us",
        roleKey: "bioFe",
        days: 25,
        photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Michael_Reed_Barratt_v2.jpg/480px-Michael_Reed_Barratt_v2.jpg",
        bio: "Physician and veteran of two previous spaceflights."
    },
    {
        name: "Jeanette Epps",
        country: "us",
        roleKey: "bioFe",
        days: 25,
        photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Jeanette_Epps_official_portrait.jpg/480px-Jeanette_Epps_official_portrait.jpg",
        bio: "Aerospace engineer on her rookie mission."
    },
    {
        name: "Alexander Grebenkin",
        country: "ru",
        roleKey: "bioFe",
        days: 25,
        photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Alexander_Grebenkin_official_portrait.jpg/480px-Alexander_Grebenkin_official_portrait.jpg",
        bio: "Cosmonaut with background in aircraft radio engineering."
    }
];

// Country flags (simple SVGs or emojis)
const FLAGS = {
    us: "🇺🇸",
    ru: "🇷🇺",
    jp: "🇯🇵",
    esa: "🇪🇺",
    ca: "🇨🇦"
};

export function createCrewBoard() {
    const container = document.createElement('div');
    container.className = 'crew-board';
    container.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;
        margin-top: 24px;
        width: 100%;
    `;

    // Header (Full width if possible, but grid makes it singular items usually)
    // We'll wrap this board in a section container in boot.js, so just cards here.

    CREW.forEach(member => {
        const card = document.createElement('div');
        card.className = 'crew-card hub-glass';
        card.style.cssText = `
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid var(--border);
            background: rgba(10,10,10,0.6);
            display: flex;
            flex-direction: column;
            transition: transform 0.2s;
        `;

        // Hover effect
        card.onmouseenter = () => { card.style.transform = "translateY(-4px)"; card.style.borderColor = "var(--accent)"; };
        card.onmouseleave = () => { card.style.transform = "translateY(0)"; card.style.borderColor = "var(--border)"; };

        // Top: Photo & Basic Info
        const head = document.createElement('div');
        head.style.cssText = `
            padding: 16px;
            display: flex;
            gap: 16px;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        `;

        const img = document.createElement('img');
        img.src = member.photo;
        img.style.cssText = `
            width: 64px;
            height: 64px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--accent);
        `;

        const info = document.createElement('div');
        info.innerHTML = `
            <div style="font-weight:700; font-size:16px;">${member.name}</div>
            <div style="display:flex; gap:6px; font-size:12px; opacity:0.7; align-items:center; margin-top:4px;">
                <span style="font-size:16px;">${FLAGS[member.country] || "🏳️"}</span>
                <span>${t(member.roleKey)}</span>
            </div>
            <div style="font-size:11px; color:var(--neon-green); margin-top:4px;">
                ${t('daysInSpace').replace('{d}', member.days)}
            </div>
        `;

        head.append(img, info);

        // Body: Bio / "Did you know?"
        const body = document.createElement('div');
        body.style.cssText = `
            padding: 12px 16px;
            font-size: 12px;
            opacity: 0.8;
            line-height: 1.4;
            background: rgba(0,0,0,0.2);
            flex: 1;
        `;
        body.innerHTML = `<strong>Did you know?</strong><br>${member.bio}`;

        card.append(head, body);
        container.append(card);
    });

    return { el: container };
}
