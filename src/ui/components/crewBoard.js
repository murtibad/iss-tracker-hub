import { t } from "../../i18n/i18n.js";
import { ICONS } from "../icons.js";

// Mock Crew Data (Localized Keys)
const CREW = [
    { key: "bioCdr", name: "Oleg Kononenko", country: "ru", bioKey: "bio1", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Oleg_Kononenko_v2.jpg/480px-Oleg_Kononenko_v2.jpg", days: 200 },
    { key: "bioFe", name: "Nikolai Chub", country: "ru", bioKey: "bio2", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Nikolai_Chub_official_portrait.jpg/480px-Nikolai_Chub_official_portrait.jpg", days: 200 },
    { key: "bioFe", name: "Loral O'Hara", country: "us", bioKey: "bio3", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Loral_O%27Hara_official_portrait.jpg/480px-Loral_O%27Hara_official_portrait.jpg", days: 170 },
    { key: "bioFe", name: "Matthew Dominick", country: "us", bioKey: "bio4", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Matthew_Dominick_official_portrait.jpg/480px-Matthew_Dominick_official_portrait.jpg", days: 25 },
    { key: "bioFe", name: "Michael Barratt", country: "us", bioKey: "bio5", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Michael_Reed_Barratt_v2.jpg/480px-Michael_Reed_Barratt_v2.jpg", days: 25 },
    { key: "bioFe", name: "Jeanette Epps", country: "us", bioKey: "bio6", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Jeanette_Epps_official_portrait.jpg/480px-Jeanette_Epps_official_portrait.jpg", days: 25 },
    { key: "bioFe", name: "Alexander Grebenkin", country: "ru", bioKey: "bio7", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Alexander_Grebenkin_official_portrait.jpg/480px-Alexander_Grebenkin_official_portrait.jpg", days: 25 }
];

// Country flags
const FLAGS = { us: "🇺🇸", ru: "🇷🇺", jp: "🇯🇵", esa: "🇪🇺", ca: "🇨🇦" };

export function createCrewBoard() {
    const container = document.createElement('div');
    container.className = 'crew-board';
    container.style.cssText = `
        display: flex; flex-direction: column; gap: 16px; margin-top: 16px; width: 100%;
    `;

    // 1. Mandatory Disclaimer (Static Data)
    const disclaimer = document.createElement('div');
    disclaimer.style.cssText = `
        background: rgba(255, 165, 0, 0.15);
        border: 1px solid rgba(255, 165, 0, 0.5);
        color: #ffca28;
        padding: 12px;
        border-radius: 8px;
        font-size: 18px; /* Strict 18px */
        font-weight: 700;
        text-align: center;
    `;
    disclaimer.textContent = t('crewParams')?.labelStatic || "ℹ️ Reference Data (Not Live)";
    container.appendChild(disclaimer);

    // 2. Grid for cards
    const grid = document.createElement('div');
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
    `;

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
        `;

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
        // Fallback for broken Wikipedia links
        img.onerror = () => {
            img.src = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';
            img.style.filter = "invert(1) opacity(0.8)"; // Make it look like a silhouette on dark theme
        };
        img.style.cssText = `
            width: 72px; height: 72px; /* Large Image */
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--accent);
        `;

        const info = document.createElement('div');
        // Role translation - doğru key lookup
        const RoleParams = t('crewParams');
        // member.key 'bioCdr' veya 'bioFe' şeklinde, crewParams içinde bu key'ler var
        const roleLabel = RoleParams && RoleParams[member.key] ? RoleParams[member.key] : (member.key === 'bioCdr' ? 'Commander' : 'Flight Engineer');

        info.innerHTML = `
            <div style="font-weight:700; font-size:20px; color: var(--text);">${member.name}</div>
            <div style="display:flex; gap:8px; font-size:18px; opacity:0.8; align-items:center; margin-top:4px;">
                <span>${FLAGS[member.country] || "🏳️"}</span>
                <span>${roleLabel}</span>
            </div>
            <div style="font-size:16px; color:var(--neon-green); margin-top:4px; font-weight:600;">
                ${t('daysInSpace').replace('{d}', member.days)}
            </div>
        `;

        head.append(img, info);

        // Body: Bio (Localized)
        const bioText = RoleParams ? RoleParams[member.bioKey] : "Bio not found";
        const body = document.createElement('div');
        body.style.cssText = `
            padding: 16px;
            font-size: 18px; /* Strict 18px */
            opacity: 0.9;
            line-height: 1.5;
            flex: 1;
            background: rgba(255,255,255,0.03);
        `;
        body.textContent = bioText;

        card.append(head, body);
        grid.append(card);
    });

    container.appendChild(grid);
    return { el: container };
}
