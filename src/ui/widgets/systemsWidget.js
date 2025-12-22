// src/ui/widgets/systemsWidget.js
import { getIcon } from "../icons.js";

export function createSystemsWidget() {
    const container = document.createElement("div");
    container.className = "systems-widget hub-glass";
    container.style.cssText = `
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        height: 100%;
        box-sizing: border-box;
    `;

    container.innerHTML = `
        <!-- Header -->
        <div style="display: flex; align-items: center; gap: 10px; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
            ${getIcon('cpu', 24)}
            <h2 style="margin: 0; font-size: 16px; font-weight: 900; letter-spacing: 1px; color: var(--text);">SİSTEM DURUMU</h2>
            <div style="margin-left: auto; display: flex; gap: 5px;">
                 <div style="width: 8px; height: 8px; background: var(--good); border-radius: 50%; box-shadow: 0 0 5px var(--good);"></div>
            </div>
        </div>

        <!-- Time System (Digital) -->
        <div style="background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); padding: 15px;">
             <div style="display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 11px; margin-bottom: 12px; text-transform: uppercase;">
                ${getIcon('clock', 14)} ZAMAN SENKRONİZASYONU
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-size: 12px; color: var(--text);">UTC</span>
                <span data-value="utc" style="font-family: 'Courier New'; font-weight: 700; color: var(--accent);">--:--:--</span>
            </div>
             <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 12px; color: var(--text);">YEREL</span>
                <span data-value="local" style="font-family: 'Courier New'; font-weight: 700; color: var(--text);">--:--:--</span>
            </div>
        </div>

        <!-- Solar Array -->
        <div style="background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); padding: 15px; flex-grow: 1; display: flex; flex-direction: column;">
             <div style="display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 11px; margin-bottom: 15px; text-transform: uppercase;">
                ${getIcon('sun', 14)} SOLAR ENERJİ ÜRETİMİ
            </div>
            
            <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 10px;">
                <div style="width: 100px; height: 100px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; position: relative;">
                     <!-- Ring -->
                     <svg style="position: absolute; top: -4px; left: -4px; width: 100px; height: 100px; transform: rotate(-90deg);">
                         <circle cx="50" cy="50" r="46" fill="none" stroke="var(--accent)" stroke-width="4" stroke-dasharray="289" stroke-dashoffset="100" />
                     </svg>
                     <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: 900; color: var(--text);">120</div>
                        <div style="font-size: 10px; color: var(--muted);">kW</div>
                     </div>
                </div>
                <div style="font-size: 11px; color: var(--good); margin-top: 10px;">NOMİNAL</div>
            </div>
        </div>

        <!-- Environment Status -->
        <div style="padding: 15px; background: rgba(50, 200, 50, 0.05); border: 1px solid rgba(50, 200, 50, 0.2); border-radius: 6px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                ${getIcon('globe', 16)}
                <div>
                    <div style="font-size: 11px; color: var(--muted); text-transform: uppercase;">ÇEVRE DURUMU</div>
                    <div style="font-size: 13px; font-weight: 700; color: var(--text);">GÜNDÜZ DÖNGÜSÜ</div>
                </div>
            </div>
        </div>
    `;

    // Elements
    const els = {
        utc: container.querySelector('[data-value="utc"]'),
        local: container.querySelector('[data-value="local"]')
    };

    const pad = n => n.toString().padStart(2, '0');

    return {
        el: container,
        update: () => {
            const now = new Date();
            els.local.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
            els.utc.textContent = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
        }
    };
}
