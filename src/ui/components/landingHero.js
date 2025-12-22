// src/ui/components/landingHero.js
// Landing hero card - First impression UX

import { t } from "../../i18n/i18n.js";

const DISMISS_KEY = "isshub:landingHeroDismissed";

export function createLandingHero({ onShowPass, onLiveTrack, getPassState }) {
  // Check if already dismissed
  if (localStorage.getItem(DISMISS_KEY) === "true") {
    return { el: null, update: () => { }, dismiss: () => { } };
  }

  const overlay = document.createElement("div");
  overlay.className = "landing-hero-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
  `;

  const card = document.createElement("div");
  card.className = "landing-hero-card glass";
  card.style.cssText = `
    max-width: 500px;
    width: 100%;
    padding: 40px 32px;
    border-radius: 24px;
    text-align: center;
    position: relative;
  `;

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "btn landing-hero-close";
  closeBtn.type = "button";
  closeBtn.innerHTML = "×";
  closeBtn.title = t("close");
  closeBtn.style.cssText = `
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 24px;
    line-height: 1;
    padding: 0;
    opacity: 0.7;
  `;

  // Headline
  const headline = document.createElement("h1");
  headline.className = "landing-hero-headline";
  headline.textContent = t("hero.headline");
  headline.style.cssText = `
    font-size: clamp(24px, 5vw, 28px);
    font-weight: 700;
    margin: 0 0 16px 0;
    line-height: 1.2;
  `;

  // Subline
  const subline = document.createElement("p");
  subline.className = "landing-hero-subline";
  subline.textContent = t("hero.subline.loading");
  subline.style.cssText = `
    font-size: clamp(14px, 3.5vw, 16px);
    opacity: 0.9;
    margin: 0 0 32px 0;
    line-height: 1.5;
    min-height: 48px;
  `;

  // CTA container
  const ctaContainer = document.createElement("div");
  ctaContainer.style.cssText = `
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  `;

  // CTA 1: Show Pass
  const showPassBtn = document.createElement("button");
  showPassBtn.className = "btn btn-primary";
  showPassBtn.type = "button";
  showPassBtn.textContent = t("hero.cta.showPass");
  showPassBtn.style.cssText = `
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
  `;

  // CTA 2: Live Track
  const liveTrackBtn = document.createElement("button");
  liveTrackBtn.className = "btn btn-ghost";
  liveTrackBtn.type = "button";
  liveTrackBtn.textContent = t("hero.cta.liveTrack");
  liveTrackBtn.style.cssText = `
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
  `;

  // Pass Card coming message (inline)
  const passComingMsg = document.createElement("div");
  passComingMsg.style.cssText = `
    margin-top: 16px;
    font-size: 13px;
    opacity: 0.7;
    display: none;
  `;
  passComingMsg.textContent = t("hero.passCardComing");

  ctaContainer.append(showPassBtn, liveTrackBtn);
  card.append(closeBtn, headline, subline, ctaContainer, passComingMsg);
  overlay.appendChild(card);

  // Dismiss function
  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "true");
    overlay.remove();
  }

  // Event handlers
  closeBtn.addEventListener("click", dismiss);

  showPassBtn.addEventListener("click", () => {
    // Show "coming soon" message instead of dismissing immediately
    passComingMsg.style.display = "block";
    setTimeout(() => {
      dismiss();
      if (onShowPass) onShowPass();
    }, 1500);
  });

  liveTrackBtn.addEventListener("click", () => {
    dismiss();
    if (onLiveTrack) onLiveTrack();
  });

  // Update subline based on pass state
  function updateSubline() {
    if (!getPassState) {
      subline.textContent = t("hero.subline.loading");
      return;
    }

    const state = getPassState();

    // State A: Loading
    if (state.loading || state.calculating) {
      subline.textContent = t("hero.subline.loading");
      return;
    }

    // State B: Pass available
    if (state.pass && state.pass.aosMs) {
      const now = Date.now();
      const minutesUntil = Math.max(1, Math.round((state.pass.aosMs - now) / 60000));
      subline.textContent = t("hero.subline.pass").replace("{minutes}", minutesUntil);
      return;
    }

    // State C: No permission or error
    if (!state.hasLocation) {
      subline.textContent = t("hero.subline.permission");
      return;
    }

    if (state.error) {
      subline.textContent = t("hero.subline.unavailable");
      return;
    }

    // Default: loading
    subline.textContent = t("hero.subline.loading");
  }

  // Auto-update every 10 seconds
  updateSubline();
  const updateInterval = setInterval(updateSubline, 10000);

  // Cleanup on dismiss
  const originalDismiss = dismiss;
  dismiss = () => {
    clearInterval(updateInterval);
    originalDismiss();
  };

  return {
    el: overlay,
    update: updateSubline, // Expose for manual updates
    dismiss
  };
}
