
import { ICONS } from "../icons.js";
import { t } from "../../i18n/i18n.js";

export function createMobileNavBar(actions) {
    const bar = document.createElement("div");
    bar.className = "mobile-nav";

    // Tabs configuration
    const tabs = [
        { id: "map", icon: ICONS.map, label: t('navMap') || "Harita" },
        { id: "nasa", icon: ICONS.video || ICONS.play, label: t('navNasaTV') || "NASA TV" },
        { id: "telemetry", icon: ICONS.activity, label: t('navTelemetry') || "Veriler" },
        { id: "passes", icon: ICONS.globe, label: t('navPasses') || "Geçişler" },
        { id: "settings", icon: ICONS.settings, label: t('settings') || "Ayarlar" }
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
