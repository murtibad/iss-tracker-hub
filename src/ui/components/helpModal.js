import { t, getCurrentLanguage } from '../../i18n/i18n.js';
import { ICONS } from '../icons.js';
import { DICTIONARY } from '../../i18n/i18n.js'; // Import DICTIONARY for direct object access
import { createCrewBoard } from '../components/crewBoard.js'; // Add Crew tab

export function createHelpModal() {
    const overlay = document.createElement('div');
    overlay.className = 'help-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(8px);
        z-index: 9999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;

    const modal = document.createElement('div');
    modal.className = 'help-modal hub-glass';
    modal.style.cssText = `
        width: 100%;
        max-width: 600px;
        max-height: 80vh;
        border-radius: 16px;
        background: var(--panel);
        border: 1px solid var(--border);
        box-shadow: 0 0 40px var(--neon-glow);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    `;

    // Internal State
    let activeTab = 'about'; // 'about', 'crew', 'glossary', 'tips', 'apis'

    function render() {
        // Get help object directly from dictionary
        const lang = getCurrentLanguage();
        const dict = DICTIONARY[lang] || DICTIONARY['tr']; // Fallback to Turkish
        const help = dict.help;

        // Fallback if help object missing
        if (!help || typeof help !== 'object') {
            modal.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text);">Help content not available</div>`;
            return;
        }

        modal.innerHTML = `
            <!-- Header -->
            <div class="help-header" style="padding: 16px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 24px; color: var(--accent); font-weight: 900; letter-spacing: 0.5px;">
                    ${ICONS.settings} ${t('helpTitle')} 
                </h2>
                <button class="help-close btn" style="font-size: 24px; background: transparent; border: none; color: var(--muted); cursor: pointer; min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center;">×</button>
            </div>

            <!-- Tabs (Mandatory Tabbed Interface) -->
            <div class="help-tabs" style="display: flex; border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.2); overflow-x: auto;">
                ${createTabBtn('about', help?.tabAbout || 'About', activeTab === 'about')}
                ${createTabBtn('crew', t('crew') || 'Crew', activeTab === 'crew')}
                ${createTabBtn('glossary', help?.tabGlossary || 'Glossary', activeTab === 'glossary')}
                ${createTabBtn('tips', help?.tabTips || 'Tips', activeTab === 'tips')}
                ${createTabBtn('apis', 'APIs', activeTab === 'apis')}
            </div>

            <!-- Content Area (Scrollable) -->
            <div class="help-content" style="flex: 1; overflow-y: auto; padding: 24px;">
                ${getTabContent(activeTab, help)}
            </div>
        `;

        // Event Bindings
        modal.querySelector('.help-close').onclick = close;

        modal.querySelectorAll('.help-tab-btn').forEach(btn => {
            btn.onclick = () => {
                activeTab = btn.dataset.tab;
                render();

                // If crew tab, inject crew board
                if (activeTab === 'crew') {
                    const container = modal.querySelector('#crew-board-container');
                    if (container) {
                        container.innerHTML = '';
                        const crewBoard = createCrewBoard();
                        container.appendChild(crewBoard.el);
                    }
                }
            };
        });

        // If initially showing crew tab, load crew board
        if (activeTab === 'crew') {
            setTimeout(() => {
                const container = modal.querySelector('#crew-board-container');
                if (container) {
                    const crewBoard = createCrewBoard();
                    container.appendChild(crewBoard.el);
                }
            }, 0);
        }
    }

    // Helper: Create Tab Button (44px min height)
    function createTabBtn(id, label, isActive) {
        const activeStyle = isActive ?
            `border-bottom: 3px solid var(--accent); color: var(--accent); background: rgba(255,255,255,0.05);` :
            `border-bottom: 3px solid transparent; color: var(--muted);`;

        return `
            <button class="help-tab-btn" data-tab="${id}" style="
                flex: 1;
                padding: 16px; 
                min-height: 54px; /* >44px */
                background: transparent;
                border: none;
                font-size: 18px; /* Strict 18px */
                font-weight: 800;
                cursor: pointer;
                transition: all 0.2s;
                ${activeStyle}
            ">
                ${label}
            </button>
        `;
    }

    // Helper: Get Content based on Tab (Strict Density Rules)
    function getTabContent(tab, help) {
        const pStyle = "font-size: 18px; line-height: 1.6; margin-bottom: 16px; color: var(--text);";
        const hStyle = "font-size: 20px; font-weight: 800; color: var(--accent); margin-bottom: 8px; margin-top: 24px;";

        if (tab === 'about') {
            return `
                <h3 style="${hStyle} margin-top: 0;">${help?.aboutTitle || 'About ISS'}</h3>
                <p style="${pStyle}">${help?.aboutText1 || ''}</p>
                <p style="${pStyle}">${help?.aboutText2 || ''}</p>
                
                <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; margin-top: 24px;">
                    <div style="${pStyle} font-weight: 700;">• ${help?.aboutSize || ''}</div>
                    <div style="${pStyle} font-weight: 700;">• ${help?.aboutSpeed || ''}</div>
                </div>
            `;
        } else if (tab === 'crew') {
            // Return placeholder - will be populated by crew board component
            return '<div id="crew-board-container"></div>';
        } else if (tab === 'glossary') {
            return `
                ${createTerm(help?.termAos || 'AOS', help?.defAos || '', hStyle, pStyle)}
                ${createTerm(help?.termLos || 'LOS', help?.defLos || '', hStyle, pStyle)}
                ${createTerm(help?.termAlt || 'Altitude', help?.defAlt || '', hStyle, pStyle)}
                ${createTerm(help?.termMag || 'Brightness', help?.defMag || '', hStyle, pStyle)}
            `;
        } else if (tab === 'tips') {
            return `
                 ${createTerm(help?.tip1Title || 'Tip 1', help?.tip1Text || '', hStyle, pStyle)}
                 ${createTerm(help?.tip2Title || 'Tip 2', help?.tip2Text || '', hStyle, pStyle)}
                 ${createTerm(help?.tip3Title || 'Tip 3', help?.tip3Text || '', hStyle, pStyle)}
            `;
        } else if (tab === 'apis') {
            return `
                <h3 style="${hStyle} margin-top: 0;">Data Sources & APIs</h3>
                ${createTerm('Where The ISS At?', 'Real-time telemetry and coordinate data.', hStyle, pStyle)}
                ${createTerm('Open Notify', 'Current crew information provided by NASA.', hStyle, pStyle)}
                ${createTerm('Open-Meteo', 'Real-time weather data for ground locations.', hStyle, pStyle)}
                ${createTerm('Nominatim (OSM)', 'Reverse geocoding to find city names.', hStyle, pStyle)}
                ${createTerm('MapTiler Cloud', 'High-performance map tiles (Dark Matter).', hStyle, pStyle)}
            `;
        }
    }

    function createTerm(title, def, hStyle, pStyle, icon = '') {
        return `
            <div style="margin-bottom: 24px; border-bottom: 1px solid var(--ring); padding-bottom: 16px;">
                <div style="${hStyle} margin-top: 0;">${icon} ${title}</div>
                <div style="${pStyle} margin-bottom: 0;">${def}</div>
            </div>
        `;
    }

    function open() {
        render(); // Re-render to catch language changes
        overlay.style.display = 'flex';
    }

    function close() {
        overlay.style.display = 'none';
    }

    overlay.onclick = (e) => {
        if (e.target === overlay) close();
    };

    overlay.appendChild(modal);

    return {
        el: overlay,
        open,
        close
    };
}
