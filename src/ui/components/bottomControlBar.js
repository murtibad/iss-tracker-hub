// src/ui/components/bottomControlBar.js
// PHASE 1: Bottom Control Bar Component (SAFE ADDITIVE FEATURE)
//
// Mobile-first thumb-zone optimized control bar
// - Only renders on mobile viewports (≤640px)
// - Safe-area inset support for iPhone notch/gesture bar
// - Minimum 52x52px touch targets (WCAG AAA)
// - Glass morphism design with backdrop blur
//
// Feature flag: window.FEATURE_MOBILE_BOTTOM_BAR

import { ICONS } from '../icons.js';

/**
 * Create bottom control bar for mobile thumb-zone interaction
 * @param {Object} options - Configuration options
 * @param {Function} options.onISSFocus - Handler for ISS focus button
 * @param {Function} options.onWorldView - Handler for world view toggle
 * @param {Function} options.onLiveFeed - Handler for live feed button
 * @param {Function} options.onSettings - Handler for settings button
 * @returns {Object} Component API
 */
export function createBottomControlBar(options = {}) {
    const {
        onISSFocus = () => { },
        onWorldView = () => { },
        onLiveFeed = () => { },
        onSettings = () => { }
    } = options;

    // Check feature flag
    if (!window.FEATURE_MOBILE_BOTTOM_BAR) {
        console.log('[Bottom Bar] Feature disabled via flag');
        return { el: null, show: () => { }, hide: () => { } };
    }

    // Container
    const container = document.createElement('div');
    container.className = 'bottom-control-bar';
    container.setAttribute('role', 'toolbar');
    container.setAttribute('aria-label', 'Mobile Control Bar');

    // Control buttons
    const buttons = [
        {
            id: 'iss-focus',
            icon: '🛰️',
            label: 'ISS',
            title: 'Focus on ISS',
            handler: onISSFocus
        },
        {
            id: 'world-view',
            icon: '🌍',
            label: 'View',
            title: 'Toggle Map/Globe',
            handler: onWorldView
        },
        {
            id: 'live-feed',
            icon: '📡',
            label: 'Live',
            title: 'Live Feed',
            handler: onLiveFeed
        },
        {
            id: 'settings',
            icon: ICONS.settings || '⚙️',
            label: 'Settings',
            title: 'Settings',
            handler: onSettings
        }
    ];

    // Create button elements
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = 'bottom-bar-btn';
        button.id = `bottom-bar-${btn.id}`;
        button.setAttribute('aria-label', btn.title);
        button.title = btn.title;

        // Icon
        const iconEl = document.createElement('div');
        iconEl.className = 'btn-icon';
        iconEl.innerHTML = btn.icon;

        // Label
        const labelEl = document.createElement('div');
        labelEl.className = 'btn-label';
        labelEl.textContent = btn.label;

        button.appendChild(iconEl);
        button.appendChild(labelEl);

        // Event handler
        button.addEventListener('click', btn.handler);

        container.appendChild(button);
    });

    // API
    const api = {
        el: container,

        show() {
            container.classList.remove('hidden');
        },

        hide() {
            container.classList.add('hidden');
        },

        setActiveButton(buttonId) {
            // Remove active class from all buttons
            container.querySelectorAll('.bottom-bar-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to specified button
            const targetBtn = container.querySelector(`#bottom-bar-${buttonId}`);
            if (targetBtn) {
                targetBtn.classList.add('active');
            }
        }
    };

    // Only show on mobile viewports
    const updateVisibility = () => {
        if (window.innerWidth <= 640 && document.body.classList.contains('mobile-ux-enabled')) {
            api.show();
        } else {
            api.hide();
        }
    };

    updateVisibility();
    window.addEventListener('resize', updateVisibility);

    return api;
}
