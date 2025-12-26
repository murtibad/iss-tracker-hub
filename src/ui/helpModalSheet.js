// src/ui/helpModalSheet.js
// PHASE 2: Help Modal converted to Bottom Sheet (SAFE ADDITIVE)
// Wrapper approach - preserves existing functionality

import { BottomSheet } from './components/bottomSheet.js';
import { createHelpModal } from './components/helpModal.js';

/**
 * Create Help as Bottom Sheet (wrapper around existing modal)
 * @returns {Object} Sheet API compatible with existing modal API
 */
export function createHelpSheet() {
    // Check feature flag - if disabled, use original modal
    if (!window.FEATURE_BOTTOM_SHEETS) {
        console.log('[Help Sheet] Feature disabled, using original modal');
        return createHelpModal();
    }

    // Create original help modal content
    const originalModal = createHelpModal();

    // Extract content from original modal
    const modalElement = originalModal.el;
    const modalContent = modalElement.querySelector('.help-modal');

    // Create bottom sheet with help content
    const sheet = new BottomSheet({
        title: 'Help',
        content: modalContent,
        dockable: true,
        maxHeight: '85vh'
    });

    // Desktop: Add docking position class
    if (window.innerWidth >= 641) {
        sheet.el.classList.add('dock-bottom-left');
    }

    // Return API compatible with original modal
    return {
        el: sheet.el,
        open: () => {
            if (window.FEATURE_BOTTOM_SHEETS) {
                sheet.open();
            } else {
                originalModal.open();
            }
        },
        close: () => {
            sheet.close();
        }
    };
}
