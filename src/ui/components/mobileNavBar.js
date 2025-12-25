
import { ICONS } from "../icons.js";
import { t } from "../../i18n/i18n.js";

export function createMobileNavBar(actions) {
    const bar = document.createElement("div");
    bar.className = "mobile-nav glass-panel";

    // Phase 6: Accessible Touch Targets
    const style = document.createElement('style');
    style.textContent = `
        .mobile-nav { 
            height: 80px !important; /* Large Touch Area */
            padding-bottom: 20px !important; /* Safe Area for modern phones */
            display: flex;
            align-items: center;
            justify-content: space-around;
            background: rgba(10, 10, 20, 0.95);
            backdrop-filter: blur(12px);
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        .nav-item {
            flex: 1;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            background: transparent;
            border: none;
            color: var(--muted);
            transition: 0.2s;
        }
        .nav-icon { font-size: 24px !important; margin-bottom: 4px; }
        .nav-label { 
            font-size: 18px !important; /* Strict 18px */
            font-weight: 600;
        }
        .nav-item.active {
            color: var(--accent);
            background: linear-gradient(to top, rgba(0,243,255,0.1), transparent);
            border-top: 3px solid var(--accent);
        }
        .nav-item.active .nav-label { font-weight: 800; }
    `;
    bar.appendChild(style);

    // Tabs configuration - 4 ana sekme
    const tabs = [
        { id: "map", icon: ICONS.map, label: t('navMap') || "Harita" },
        { id: "telemetry", icon: ICONS.activity, label: t('navTelemetry') || "Bilgi" },
        { id: "nasa", icon: ICONS.video || ICONS.play, label: "NASA" },
        { id: "passes", icon: ICONS.globe, label: t('navPasses') || "Geçiş" }
    ];

    let activeTab = "map";

    function render() {
        bar.innerHTML = "";
        tabs.forEach(tab => {
            const btn = document.createElement("button");
            btn.className = `nav-item ${activeTab === tab.id ? "active" : ""}`;
            btn.innerHTML = `
        <div class="nav-icon">${tab.icon}</div>
        <span class="nav-label">${tab.label}</span>
      `;
            btn.onclick = () => setActive(tab.id);
            bar.appendChild(btn);
        });
    }

    function setActive(id) {
        if (activeTab === id && id !== 'settings') return; // Don't re-trigger unless it's settings (modal)

        // Settings is a modal, so it doesn't change the main view necessarily, 
        // but for this nav implementation, let's treat it as a trigger.
        if (id === 'settings') {
            if (actions.onSettings) actions.onSettings();
            return;
        }

        activeTab = id;
        render();
        if (actions.onChange) actions.onChange(id);
    }

    render();

    return {
        el: bar,
        setActive
    };
}
