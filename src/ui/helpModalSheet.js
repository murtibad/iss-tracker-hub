// src/ui/helpModalSheet.js
// Help Modal - Uses original modal directly (bottom sheet was causing layout issues)

import { createHelpModal } from './components/helpModal.js';

/**
 * Create Help Modal
 * Uses the original modal implementation for stability
 * @returns {Object} Modal API with el, open, close
 */
export function createHelpSheet() {
    // Always use the original modal - bottom sheet wrapper was causing layout issues
    console.log('[Help Sheet] Using original modal for stability');
    return createHelpModal();
}
