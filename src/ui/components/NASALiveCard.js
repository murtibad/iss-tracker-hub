import { t } from "../../i18n/i18n.js";
import { ICONS } from "../icons.js"; // Ensure ICONS is imported or use inline svg



export function createNASALiveCard() {
  const container = document.createElement('div');
  container.className = 'nasa-card hub-glass';
  container.style.cssText = `
    width: 100%;
    margin-bottom: 24px;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    border: 1px solid var(--border);
    background: #000;
  `;

  // Header (Title)
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0,243,255,0.05);
    border-bottom: 1px solid var(--border);
  `;

  const title = document.createElement('div');
  title.textContent = "🔴 " + (t('nasa')?.title || "NASA Live");
  title.style.cssText = "font-size: 20px; font-weight: 800; color: var(--accent);";
  header.appendChild(title);

  // Video Wrapper
  const vidWrap = document.createElement('div');
  vidWrap.style.cssText = `
    position: relative;
    padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
    height: 0;
    overflow: hidden;
    background: #111;
  `;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; border:none;";
  // Important: Src empty initially (No Autoplay)
  vidWrap.appendChild(iframe);

  // Overlay for "User Initiated Playback"
  const startOverlay = document.createElement('div');
  startOverlay.style.cssText = `
    position: absolute; top:0; left:0; width:100%; height:100%;
    background: rgba(0,0,0,0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 20;
    backdrop-filter: blur(4px);
  `;

  const startBtn = document.createElement('button');
  startBtn.className = "btn";
  startBtn.innerHTML = t('nasa')?.btnStart || "📺 Start Stream";
  startBtn.style.cssText = `
    font-size: 20px; /* Large Text */
    padding: 16px 32px;
    min-height: 60px; /* Large Target */
    border-radius: 99px;
    background: var(--accent);
    color: #000;
    border: none;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 0 20px var(--neon-glow);
  `;
  startOverlay.appendChild(startBtn);
  vidWrap.appendChild(startOverlay);

  // Stream Sources (Localized)
  const streams = [
    { id: 'hd', labelKey: 'streamCam1', videoId: 'xRPjKQtRKT8' },
    { id: 'std', labelKey: 'streamTv', videoId: '21X5lGlDOfg' },
    { id: 'media', labelKey: 'streamMedia', videoId: '86YLFOog4GM' }
  ];

  let activeStream = streams[0];
  let isPlaying = false;

  // Stream Selectors (Large Targets)
  const controls = document.createElement('div');
  controls.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border-top: 1px solid var(--border);
    background: rgba(255,255,255,0.02);
  `;

  const renderControls = () => {
    controls.innerHTML = "";
    streams.forEach(s => {
      const label = t('nasa')?.[s.labelKey] || s.id;
      const isActive = s.id === activeStream.id;

      const btn = document.createElement('button');
      btn.style.cssText = `
        background: ${isActive ? 'rgba(0,243,255,0.15)' : 'transparent'};
        border: none;
        border-right: 1px solid var(--border);
        color: ${isActive ? 'var(--accent)' : 'var(--muted)'};
        font-size: 18px; /* Strict 18px */
        font-weight: ${isActive ? '700' : '400'};
        padding: 16px 8px;
        min-height: 64px; /* Large Touch Target */
        cursor: pointer;
        transition: 0.2s;
      `;
      btn.textContent = label;

      btn.onclick = () => {
        activeStream = s;
        renderControls();
        if (isPlaying) loadVideo();
      };

      controls.appendChild(btn);
    });
  };

  const loadVideo = () => {
    // Only set src when explicitly requested
    const newSrc = `https://www.youtube.com/embed/${activeStream.videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`;
    if (iframe.src !== newSrc) {
      iframe.src = newSrc;
    }
    startOverlay.style.display = 'none';
    isPlaying = true;
  };

  startBtn.onclick = loadVideo;

  container.appendChild(header);
  container.appendChild(vidWrap);
  container.appendChild(controls);

  // Initial Render
  renderControls();

  return { el: container };
}
