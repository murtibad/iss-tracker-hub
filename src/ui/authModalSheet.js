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

    // Call open to trigger initial render (but don't show overlay yet)
    originalModal.open('login');

    // Extract content from original modal (use .auth-modal, not .hub-modal)
    const modalElement = originalModal.el;
    const modalContent = modalElement.querySelector('.auth-modal');

    if (!modalContent) {
        console.error('[Auth Sheet] Could not find .auth-modal content');
        return createAuthModal(); // Fallback to original
    }

    // Create bottom sheet with auth content
    const sheet = new BottomSheet({
        title: 'Sign In',
        content: modalContent,
        dockable: true,
        maxHeight: '70vh'
    });

    // FIX: Add class to handle embedded styling (hide inner header, reset card styles)
    modalContent.classList.add('auth-sheet-embedded');

    // Inject styles effectively (handling re-renders which recreate innerHTML)
    if (!document.getElementById('auth-sheet-styles')) {
        const style = document.createElement('style');
        style.id = 'auth-sheet-styles';
        style.textContent = `
            .auth-sheet-embedded .auth-header { display: none !important; }
            .auth-sheet-embedded { 
                background: transparent !important; 
                box-shadow: none !important; 
                border: none !important; 
                padding: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Desktop: Center position for auth (important action)
    if (window.innerWidth >= 641) {
        sheet.el.classList.add('dock-center');
    }

    // Hide the original overlay completely (prevents double rendering)
    modalElement.style.display = 'none';
    modalElement.style.visibility = 'hidden';
    modalElement.style.pointerEvents = 'none';

    // Return API compatible with original modal
    return {
        el: sheet.el,
        open: (initialMode = 'login') => {
            // Don't call originalModal.open() again - content already rendered
            // Just show the bottom sheet
            sheet.open();
        },
        close: () => {
            sheet.close();
            originalModal.close();
        }
    };
}
