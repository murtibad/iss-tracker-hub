// src/ui/intro.js
// TR: İlk açılış animasyonu - premium ilk izlenim
// EN: Initial loading animation - premium first impression

import { prefersReducedMotion } from '../utils/motionUtils.js';
import { CONFIG } from '../constants/config.js';

const INTRO_STORAGE_KEY = 'isshub:intro-seen';

/**
 * Check if intro should be skipped
 */
function shouldSkipIntro() {
    // Skip if user has seen intro recently (within 1 hour)
    const lastSeen = localStorage.getItem(INTRO_STORAGE_KEY);
    if (lastSeen) {
        const hourAgo = Date.now() - (60 * 60 * 1000);
        if (parseInt(lastSeen) > hourAgo) {
            return true;
        }
    }

    // Skip if reduced motion preferred
    if (prefersReducedMotion()) {
        return true;
    }

    return false;
}

/**
 * Create and show intro animation
 * @param {Function} onComplete - Callback when intro finishes
 * @returns {HTMLElement|null} Intro element or null if skipped
 */
export function createIntro(onComplete) {
    if (shouldSkipIntro()) {
        if (onComplete) setTimeout(onComplete, 0);
        return null;
    }

    // Mark as seen
    localStorage.setItem(INTRO_STORAGE_KEY, Date.now().toString());

    const intro = document.createElement('div');
    intro.id = 'intro-overlay';
    intro.className = 'intro-overlay';

    intro.innerHTML = `
    <div class="intro-container">
      <div class="intro-iss-icon">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" stroke="var(--accent)" stroke-width="1" opacity="0.3"/>
          <circle cx="50" cy="50" r="35" stroke="var(--accent)" stroke-width="1" opacity="0.5"/>
          <circle cx="50" cy="50" r="25" stroke="var(--accent)" stroke-width="2"/>
          <!-- ISS Icon -->
          <rect x="35" y="45" width="30" height="10" fill="var(--accent)" rx="2"/>
          <rect x="25" y="42" width="10" height="16" fill="var(--accent)" opacity="0.8"/>
          <rect x="65" y="42" width="10" height="16" fill="var(--accent)" opacity="0.8"/>
          <rect x="18" y="38" width="7" height="24" fill="var(--accent)" opacity="0.6"/>
          <rect x="75" y="38" width="7" height="24" fill="var(--accent)" opacity="0.6"/>
          <!-- Blinking dot -->
          <circle class="intro-blink" cx="50" cy="50" r="3" fill="#ff0000"/>
        </svg>
      </div>
      <h1 class="intro-title">ISS Tracker HUB</h1>
      <p class="intro-subtitle">Real-time Space Station Tracking</p>
      <div class="intro-loader">
        <div class="intro-loader-bar"></div>
      </div>
      <p class="intro-status">Loading orbit data...</p>
    </div>
  `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
    .intro-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: var(--bg, #0a0a12);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 1;
      transition: opacity 0.6s ease;
    }
    
    .intro-overlay.fade-out {
      opacity: 0;
      pointer-events: none;
    }
    
    .intro-container {
      text-align: center;
      animation: intro-fade-in 0.8s ease;
    }
    
    .intro-iss-icon {
      width: 120px;
      height: 120px;
      margin: 0 auto 24px;
      animation: intro-pulse 2s infinite ease-in-out;
    }
    
    .intro-iss-icon svg {
      width: 100%;
      height: 100%;
    }
    
    .intro-blink {
      animation: intro-blink 1s infinite;
    }
    
    .intro-title {
      font-family: 'Orbitron', monospace;
      font-size: 28px;
      font-weight: 700;
      color: var(--accent, #00f3ff);
      margin: 0 0 8px;
      letter-spacing: 4px;
      text-transform: uppercase;
      animation: intro-slide-up 0.8s ease 0.2s both;
    }
    
    .intro-subtitle {
      font-size: 14px;
      color: var(--muted, rgba(255,255,255,0.6));
      margin: 0 0 32px;
      letter-spacing: 2px;
      animation: intro-slide-up 0.8s ease 0.4s both;
    }
    
    .intro-loader {
      width: 200px;
      height: 3px;
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
      margin: 0 auto 16px;
      overflow: hidden;
      animation: intro-slide-up 0.8s ease 0.5s both;
    }
    
    .intro-loader-bar {
      width: 0;
      height: 100%;
      background: var(--accent, #00f3ff);
      border-radius: 2px;
      animation: intro-load 2s ease-out forwards;
    }
    
    .intro-status {
      font-size: 11px;
      color: var(--muted, rgba(255,255,255,0.5));
      margin: 0;
      animation: intro-slide-up 0.8s ease 0.6s both;
    }
    
    @keyframes intro-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes intro-slide-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes intro-pulse {
      0%, 100% {
        transform: scale(1);
        filter: drop-shadow(0 0 10px var(--accent));
      }
      50% {
        transform: scale(1.05);
        filter: drop-shadow(0 0 20px var(--accent));
      }
    }
    
    @keyframes intro-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.2; }
    }
    
    @keyframes intro-load {
      0% { width: 0; }
      20% { width: 20%; }
      50% { width: 60%; }
      80% { width: 85%; }
      100% { width: 100%; }
    }
  `;

    document.head.appendChild(style);
    document.body.appendChild(intro);

    // Status updates
    const statusEl = intro.querySelector('.intro-status');
    const statusMessages = [
        'Loading orbit data...',
        'Calculating trajectory...',
        'Connecting to telemetry...',
        'Almost ready...'
    ];

    let msgIndex = 0;
    const statusInterval = setInterval(() => {
        msgIndex++;
        if (msgIndex < statusMessages.length) {
            statusEl.textContent = statusMessages[msgIndex];
        }
    }, 500);

    // Complete after 2.5 seconds
    setTimeout(() => {
        clearInterval(statusInterval);
        intro.classList.add('fade-out');

        setTimeout(() => {
            intro.remove();
            style.remove();
            if (onComplete) onComplete();
        }, 600);
    }, 2500);

    return intro;
}

/**
 * Force skip intro (for development)
 */
export function skipIntro() {
    const intro = document.getElementById('intro-overlay');
    if (intro) {
        intro.classList.add('fade-out');
        setTimeout(() => intro.remove(), 300);
    }
}
