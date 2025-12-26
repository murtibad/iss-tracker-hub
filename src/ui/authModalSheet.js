// src/ui/authModalSheet.js
// PHASE 2: Auth Modal converted to Bottom Sheet (SAFE ADDITIVE)
// Wrapper approach - preserves existing functionality

import { BottomSheet } from './components/bottomSheet.js';
import { createAuthModal } from './components/authModal.js';

/**
 * Create Auth as Bottom Sheet (wrapper around existing modal)
 * @returns {Object} Sheet API compatible with existing modal API
 */
export function createAuthSheet() {
    // Check feature flag - if disabled, use original modal
    if (!window.FEATURE_BOTTOM_SHEETS) {
        console.log('[Auth Sheet] Feature disabled, using original modal');
        return createAuthModal();
    }

    // Create original auth modal content
    const originalModal = createAuthModal();

    // Extract content from original modal
    const modalElement = originalModal.el;
    const modalContent = modalElement.querySelector('.hub-modal');

    // Create bottom sheet with auth content
    const sheet = new BottomSheet({
        title: 'Sign In',
        content: modalContent,
        dockable: true,
        maxHeight: '70vh'
    });

    // Desktop: Center position for auth (important action)
    if (window.innerWidth >= 641) {
        sheet.el.classList.add('dock-center'); // Will need CSS for this
    }

    // Return API compatible with original modal
    return {
        el: sheet.el,
        open: (initialMode = 'login') => {
            if (window.FEATURE_BOTTOM_SHEETS) {
                sheet.open();
                // Preserve initialMode if original modal supports it
                if (originalModal.open) {
                    originalModal.open(initialMode);
                }
            } else {
                originalModal.open(initialMode);
            }
        },
        close: () => {
            sheet.close();
        }
    };
}
