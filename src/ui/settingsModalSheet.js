// src/ui/settingsModalSheet.js
// PHASE 2: Settings Modal converted to Bottom Sheet (SAFE ADDITIVE)
//
// Wrapper approach: Wraps existing settingsModal.js logic in BottomSheet
// - Preserves all existing functionality
// - Adds mobile bottom sheet behavior
// - Desktop: Can be docked or use existing modal approach
//
// Feature flag: window.FEATURE_BOTTOM_SHEETS

import { BottomSheet } from './components/bottomSheet.js';
import { createSettingsModal } from './settingsModal.js';

/**
 * Create Settings as Bottom Sheet (wrapper around existing modal)
 * @param {Object} options - Configuration options
 * @returns {Object} Sheet API compatible with existing modal API
 */
export function createSettingsSheet(options = {}) {
    // Check feature flag - if disabled, use original modal
    if (!window.FEATURE_BOTTOM_SHEETS) {
        console.log('[Settings Sheet] Feature disabled, using original modal');
        return createSettingsModal(options);
    }

    // Create original settings modal content
    const originalModal = createSettingsModal(options);

    // Extract content from original modal
    const modalElement = originalModal.el;
    const modalContent = modalElement.querySelector('.hub-modal');

    // Create bottom sheet with settings content
    const sheet = new BottomSheet({
        title: 'Settings',
        content: modalContent,
        dockable: true,
        onOpen: () => {
            console.log('[Settings Sheet] Opened');
        },
        onClose: () => {
            console.log('[Settings Sheet] Closed');
        }
    });

    // Desktop: Add docking position class
    if (window.innerWidth >= 641) {
        sheet.el.classList.add('dock-bottom-right');
    }

    // Return API compatible with original modal
    return {
        el: sheet.el,
        open: () => {
            // Before opening, check if we should use sheet or original modal
            if (window.FEATURE_BOTTOM_SHEETS && window.innerWidth <= 640) {
                // Mobile: Use bottom sheet
                sheet.open();
            } else if (window.FEATURE_BOTTOM_SHEETS && window.innerWidth > 640) {
                // Desktop: Use bottom sheet as docked panel
                sheet.open();
            } else {
                // Fallback: Use original modal
                originalModal.open();
            }
        },
        close: () => {
            sheet.close();
        }
    };
}
