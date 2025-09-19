// spymaster.js
//
// Main entry point for the spymaster view in Themed Codenames. Handles board loading, URL management, error handling, and UI updates for the spymaster role.

import { SpymasterUIManager } from './spymasterUIManager.js';
import { SpymasterBoard } from './spymasterBoard.js';
import { API } from './api.js';
import { Utils } from './utils.js';

class SpymasterGame {
    constructor() {
        this.ui = new SpymasterUIManager();
        this.board = new SpymasterBoard(API);
        this.theme = null;
        this.seed = null;
        this.boardId = null;
        
        this.initializeGame();
    }

    async initializeGame() {
        console.log('Spymaster view loaded');

        // Initialize URL parameters
        const urlParams = Utils.getUrlParams();
        this.seed = urlParams.get('seed') || Utils.generateSeed();
        this.theme = urlParams.get('theme');
        this.boardId = urlParams.get('board_id');

        // Update URL if seed was generated
        if (!urlParams.get('seed')) {
            urlParams.set('seed', this.seed);
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.replaceState(null, '', newUrl);
        }

        console.log(`Seed used: ${this.seed}`);

        try {
            await this.loadBoard();
            this.ui.updateToggleButton(this.seed, this.theme, this.boardId);
        } catch (error) {
            console.error("Failed to initialize spymaster board:", error);
            this.ui.showErrorPopup(
                error.title || 'Board Loading Error',
                error.userMessage || 'Unable to load the game board. Please check your internet connection and try again.'
            );
        }
    }

    async loadBoard() {
        try {
            const result = await this.board.initializeBoard(this.seed, this.theme, this.boardId);
            
            // If we loaded from board_id, update our local state
            if (result.loadedTheme) {
                this.theme = result.loadedTheme;
            }
            if (result.loadedSeed) {
                this.seed = result.loadedSeed;
            }

            // Update URL if we got new information from the board
            if (result.loadedTheme || result.loadedSeed) {
                Utils.updateCurrentUrl(this.seed, this.theme, this.boardId);
            }

            // Populate the board with colors revealed for spymaster
            this.board.populateBoard(result.words, result.colors);

        } catch (error) {
            // Enhanced error handling for spymaster-specific errors
            if (error.message.includes('board_id')) {
                error.title = 'Board Not Found';
                error.userMessage = `Board with ID "${this.boardId}" could not be found. It may have been deleted or the ID is incorrect.`;
            } else if (!error.userMessage) {
                error.title = 'Loading Error';
                error.userMessage = error.message;
            }
            throw error;
        }
    }

}

// Initialize the spymaster game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SpymasterGame();
});