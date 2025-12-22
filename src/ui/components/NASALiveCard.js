import { t } from "../../i18n/i18n.js";
import { ICONS } from "../icons.js"; // Ensure ICONS is imported or use inline svg

export function createNASALiveCard() {
  const container = document.createElement('div');
  container.className = 'nasa-card hub-glass';
  container.style.cssText = `
    width: 100%;
    margin-bottom: 12px;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    border: 1px solid var(--border);
    background: #000;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0,243,255,0.1);
    border-bottom: 1px solid var(--border);
  `;

  const title = document.createElement('div');
  title.className = 'cyber-glitch-text';
  title.setAttribute('data-text', t('nasaLive') || 'NASA LIVE');
  title.textContent = t('nasaLive') || 'NASA LIVE';
  title.style.fontSize = '12px';
  header.appendChild(title);

  const badge = document.createElement('div');
  badge.innerHTML = '<span style="color:red; animation: blink 1s infinite;">●</span> LIVE';
  badge.style.cssText = "font-size: 10px; font-weight: bold; color: #fff;";
  header.appendChild(badge);

  // Video Wrapper
  const vidWrap = document.createElement('div');
  vidWrap.style.cssText = `
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    background: #000;
  `;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; border:none;";
  vidWrap.appendChild(iframe);

  // Locked Overlay
  const lockedOverlay = document.createElement('div');
  lockedOverlay.className = "stream-locked";
  lockedOverlay.style.cssText = `
    position: absolute; top:0; left:0; width:100%; height:100%;
    background: rgba(10,10,15,0.9);
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    color: var(--neon-pink);
    gap: 8px;
  `;
  lockedOverlay.innerHTML = `
    <div style="font-size:24px;">🚫</div>
    <div style="font-size:12px; text-transform:uppercase; letter-spacing:1px;">${t('streamLocked')}</div>
  `;
  vidWrap.appendChild(lockedOverlay);

  // Stream Sources
  // Stream Sources
  const streams = [
    { id: 'hd', label: 'ISS Cam 1', videoId: 'xRPjKQtRKT8', available: true }, // Official NASA Live Earth Views (Reliable)
    { id: 'std', label: 'NASA TV', videoId: '21X5lGlDOfg', available: true },  // NASA Public
    { id: 'cam2', label: 'ISS Cam 2', videoId: '86YLFOog4GM', available: true } // Alternative Space Videos Mirror (Backup)
  ];

  let activeStream = streams[0];

  // Controls (Stream Selectors)
  const controls = document.createElement('div');
  controls.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border-top: 1px solid var(--border);
  `;

  const loadStream = (s) => {
    activeStream = s;
    updateUI();
  };

  const updateUI = () => {
    controls.innerHTML = "";
    streams.forEach(s => {
      const btn = document.createElement('button');
      btn.className = "btn-stream";
      btn.style.cssText = `
        background: transparent;
        border: none;
        border-right: 1px solid var(--border);
        color: var(--muted);
        font-size: 10px;
        padding: 8px 4px;
        cursor: pointer;
        position: relative;
        transition: 0.2s;
        height: 100%;
      `;
      if (s === streams[streams.length - 1]) btn.style.borderRight = "none";

      btn.textContent = s.label;

      if (s.id === activeStream.id) {
        btn.style.color = "var(--neon-cyan)";
        btn.style.background = "rgba(0,243,255,0.1)";
      }

      if (!s.available) {
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
        const lockIcon = document.createElement('span');
        lockIcon.textContent = "🔒";
        lockIcon.style.marginRight = "4px";
        btn.prepend(lockIcon);
      }

      btn.onclick = () => {
        // If unavailable, we can still select it to SHOW the lock screen?
        // Or just prevent click? User request: "kullanılamayan seçenek kilitlensin... yazsın"
        // Let's allow select but show lock screen.
        loadStream(s);
      };

      controls.appendChild(btn);
    });

    // Update Video State
    if (activeStream.available) {
      lockedOverlay.style.display = 'none';
      // Only update src if different to prevent reload
      const newSrc = `https://www.youtube.com/embed/${activeStream.videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`;
      if (iframe.src !== newSrc) iframe.src = newSrc;
    } else {
      lockedOverlay.style.display = 'flex';
      iframe.src = ""; // Stop video
    }
  };

  container.appendChild(header);
  container.appendChild(vidWrap);
  container.appendChild(controls);

  // Init
  loadStream(streams[0]);

  return { el: container };
}
