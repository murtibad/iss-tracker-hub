// src/ui/widgets/flightDataWidget.js
import { getIcon } from "../icons.js";
import { COPY } from "../../constants/copy.js";

export function createFlightDataWidget() {
    const container = document.createElement("div");
    container.className = "flight-data-widget hub-glass";
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
            ${getIcon('activity', 24)}
            <h2 style="margin: 0; font-size: 16px; font-weight: 900; letter-spacing: 1px; color: var(--text);">UÇUŞ VERİLERİ</h2>
            <div style="margin-left: auto; display: flex; gap: 5px;">
                <div style="width: 8px; height: 8px; background: var(--good); border-radius: 50%; box-shadow: 0 0 5px var(--good);"></div>
                <div style="width: 8px; height: 8px; background: rgba(255,255,255,0.2); border-radius: 50%;"></div>
            </div>
        </div>

        <!-- Primary Telemetry (Alt/Speed) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="stat-box" style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 11px; margin-bottom: 5px; text-transform: uppercase;">
                    ${getIcon('arrowUp', 14)}
                    İRTİFA
                </div>
                <div data-value="altitude" style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: 700; color: var(--accent); white-space: nowrap;">---</div>
                <div style="font-size: 10px; color: var(--muted); text-align: right;">km</div>
            </div>
            
            <div class="stat-box" style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 11px; margin-bottom: 5px; text-transform: uppercase;">
                    ${getIcon('zap', 14)}
                    HIZ
                </div>
                <div data-value="speed" style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: 700; color: var(--accent); white-space: nowrap;">---</div>
                <div style="font-size: 10px; color: var(--muted); text-align: right;">km/h</div>
            </div>
        </div>

        <!-- Coordinates & Status -->
        <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.02); border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted);">
                    ${getIcon('mapPin', 14)} KONUM
                </div>
                <div style="font-family: 'Courier New', monospace; font-size: 13px; color: var(--text);">
                    <span data-value="lat">--.----</span> / <span data-value="lon">--.----</span>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.02); border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted);">
                    ${getIcon('globe', 14)} YÜZEY
                </div>
                <div data-value="footprint" style="font-family: 'Courier New', monospace; font-size: 13px; color: var(--text); text-transform: uppercase;">
                    ---
                </div>
            </div>
             <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.02); border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted);">
                    ${getIcon('wifi', 14)} İLETİŞİM
                </div>
                <div style="font-family: 'Courier New', monospace; font-size: 13px; color: var(--good); font-weight: bold;">
                    ACTIVE
                </div>
            </div>
        </div>

        <!-- Next Pass (Simplified) -->
        <div style="margin-top: 10px; background: linear-gradient(90deg, rgba(var(--accent), 0.1), transparent); border-left: 3px solid var(--accent); padding: 15px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 5px;">SONRAKİ GEÇİŞ</div>
            <div data-value="countdown" style="font-size: 28px; font-weight: 300; font-family: 'Courier New', monospace; color: var(--text);">--:--:--</div>
            <div data-value="pass-status" style="font-size: 12px; color: var(--muted); margin-top: 5px;">Hesaplanıyor...</div>
        </div>

        <!-- Distances Table -->
        <div style="flex-grow: 1;"></div> <!-- Spacer -->
        
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
            <div style="font-size: 11px; color: var(--muted); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Göreceli Uzaklıklar</div>
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                    <td style="padding: 8px 0; color: var(--text);"><span style="opacity:0.7; margin-right:5px;">${getIcon('sun', 12)}</span> Güneş</td>
                    <td style="text-align: right; font-family: 'Courier New'; color: var(--accent);">~149M km</td>
                </tr>
                 <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                    <td style="padding: 8px 0; color: var(--text);"><span style="opacity:0.7; margin-right:5px;">${getIcon('moon', 12)}</span> Ay</td>
                    <td style="text-align: right; font-family: 'Courier New'; color: var(--accent);">~384K km</td>
                </tr>
                 <tr>
                    <td style="padding: 8px 0; color: var(--text);"><span style="opacity:0.7; margin-right:5px;">${getIcon('earth', 12)}</span> Dünya</td>
                    <td data-value="dist-earth" style="text-align: right; font-family: 'Courier New'; color: var(--accent);">--- km</td>
                </tr>
            </table>
        </div>
    `;

    // Elements for update
    const els = {
        alt: container.querySelector('[data-value="altitude"]'),
        speed: container.querySelector('[data-value="speed"]'),
        lat: container.querySelector('[data-value="lat"]'),
        lon: container.querySelector('[data-value="lon"]'),
        footprint: container.querySelector('[data-value="footprint"]'),
        countdown: container.querySelector('[data-value="countdown"]'),
        passStatus: container.querySelector('[data-value="pass-status"]'),
        distEarth: container.querySelector('[data-value="dist-earth"]')
    };

    return {
        el: container,
        update: (data) => {
            if (data.altitude) {
                els.alt.textContent = data.altitude.toFixed(1);
                els.distEarth.textContent = `~${Math.round(data.altitude)} km`;
            }
            if (data.velocity) els.speed.textContent = Math.round(data.velocity).toLocaleString('tr-TR');
            if (data.latitude) els.lat.textContent = data.latitude.toFixed(4);
            if (data.longitude) els.lon.textContent = data.longitude.toFixed(4);
            if (data.footprint) els.footprint.textContent = data.footprint.toUpperCase();

            // Pass updates
            if (data.pass) {
                const p = data.pass;
                const now = Date.now();
                const msLeft = Math.max(0, p.aosMs - now);

                // Helper fmt
                const pad = n => n.toString().padStart(2, '0');
                const h = Math.floor(msLeft / 3600000);
                const m = Math.floor((msLeft % 3600000) / 60000);
                const s = Math.floor((msLeft % 60000) / 1000);

                els.countdown.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;

                if (p.visible) {
                    els.passStatus.textContent = `✅ GÖRÜNÜR GEÇİŞ (Max ${Math.round(p.maxElevDeg)}°)`;
                    els.passStatus.style.color = "var(--good)";
                } else {
                    els.passStatus.textContent = `Görülemez (${p.reason || 'Ufuk altı'})`;
                    els.passStatus.style.color = "var(--muted)";
                }
            } else if (data.pass === null) {
                els.countdown.textContent = "--:--:--";
                els.passStatus.textContent = "Hesaplanıyor...";
            }
        }
    };
}
