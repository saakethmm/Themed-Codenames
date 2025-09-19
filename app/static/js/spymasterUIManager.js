// spymasterUIManager.js
//
// Provides the SpymasterUIManager class, extending UIManager for the spymaster view. Handles UI updates specific to the spymaster, disabling player-only features.

import { UIManager } from './uiManager.js';

export class SpymasterUIManager extends UIManager {
    constructor() {
        // Spymaster doesn't need game state tracking, so pass null
        super(null);
    }

    updateToggleButton(seed, theme, boardId) {
        const toggleButton = document.getElementById('view-toggle');
        if (toggleButton) {
            const currentHref = toggleButton.getAttribute('href').split('?')[0];

            let newUrl = `${currentHref}?seed=${seed}`;
            if (theme) {
                newUrl += `&theme=${encodeURIComponent(theme)}`;
            }
            if (boardId) {
                newUrl += `&board_id=${boardId}`;
            }

            toggleButton.setAttribute('href', newUrl);
        }
    }

    // Override methods that don't apply to spymaster view
    updateTurnDisplay() {
        // Spymaster doesn't show turn indicator
    }

    updateScore() {
        // Spymaster doesn't show score
    }

    updateShuffleButton() {
        // Spymaster doesn't show shuffle button
    }

    updateUndoButton() {
        // Spymaster doesn't show undo button
    }

    toggleBoardButtons() {
        // Spymaster doesn't show game buttons
    }

    restoreUIState() {
        // Spymaster doesn't need UI state restoration
    }
}