import { GameState } from './gameState.js';
import { UIManager } from './uiManager.js';
import { Board } from './board.js';
import { API } from './api.js';
import { Utils } from './utils.js';

class CodeNamesGame {
    constructor() {
        this.gameState = new GameState();
        this.ui = new UIManager(this.gameState);
        this.board = new Board(this.gameState, this.ui, API);
        this.theme = null;
        this.seed = null;
        
        this.initializeGame();
    }

    async initializeGame() {
        console.log('DOM fully loaded');

        // Initialize URL parameters
        const urlParams = Utils.getUrlParams();
        this.seed = urlParams.get('seed') || Utils.generateSeed();
        this.theme = urlParams.get('theme');
        const existingBoardId = urlParams.get('board_id');

        // Update URL if seed was generated
        if (!urlParams.get('seed')) {
            urlParams.set('seed', this.seed);
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.replaceState(null, '', newUrl);
        }

        console.log(`Seed used: ${this.seed}`);

        // Initialize the scoreboard and UI
        this.ui.updateScore(0, 0, false);
        this.ui.updateTurnDisplay(false);
        this.ui.updateToggleButton(this.seed, this.theme, this.gameState.boardId);

        this.setupEventListeners();

        // Load game if theme is provided
        if (this.theme) {
            await this.loadGame(existingBoardId);
        }
    }

    async loadGame(existingBoardId) {
        try {
            const themeInput = document.getElementById('theme');
            themeInput.value = this.theme;
            
            let words, usedWords, usedColors, boardId;
            
            // Check if we have an existing board to load
            if (existingBoardId) {
                try {
                    const boardData = await API.loadBoard(existingBoardId);
                    
                    // Load existing board state
                    this.gameState.loadState(boardData);
                    
                    const result = this.board.populateBoard(boardData.words, this.seed, false);
                    usedWords = result.words;
                    usedColors = result.colors;
                    boardId = existingBoardId;
                    
                    // Restore UI to match loaded state
                    this.ui.restoreUIState();
                    
                    console.log("Loaded existing board:", existingBoardId);
                } catch (error) {
                    console.error("Failed to load existing board, creating new one:", error);
                    words = await API.fetchWords(this.theme);
                    const result = this.board.populateBoard(words, this.seed, true);
                    usedWords = result.words;
                    usedColors = result.colors;
                    boardId = await API.saveBoard(this.gameState, this.theme, this.seed, null);
                }
            } else {
                // Create new board
                words = await API.fetchWords(this.theme);
                const result = this.board.populateBoard(words, this.seed, true);
                usedWords = result.words;
                usedColors = result.colors;
                boardId = await API.saveBoard(this.gameState, this.theme, this.seed, null);
            }
            
            this.gameState.boardId = boardId;
            Utils.updateCurrentUrl(this.seed, this.theme, boardId);

            // Update the title with the score after the board is loaded
            if (!existingBoardId) {
                this.ui.updateScore(0, 0, true);
            }

            // Show the turn indicator and toggle button
            this.ui.updateTurnDisplay(true);
            document.querySelector('.view-toggle').style.display = 'block';
            
            // Hide theme input and show game buttons
            this.showGameUI();
        } catch (error) {
            console.error("Failed to load theme:", error);
            this.ui.showErrorPopup(
                error.title || 'Failed to Load Theme',
                error.userMessage || `Unable to fetch words for theme "${this.theme}". Please check your internet connection and try again.`
            );
        }
    }

    showGameUI() {
        document.querySelector('.theme-input').style.display = 'none';
        this.ui.toggleBoardButtons(true);
    }

    showThemeInput() {
        document.querySelector('.theme-input').style.display = 'flex';
        this.ui.toggleBoardButtons(false);
        document.querySelector('.board').innerHTML = '';
        document.querySelector('.turn-indicator').style.display = 'none';
        document.querySelector('.view-toggle').style.display = 'none';
    }

    async handleThemeSubmission() {
        const themeInput = document.getElementById('theme');
        const theme = themeInput.value.trim();
        
        if (!theme) {
            alert('Please enter a theme');
            return;
        }

        const submitButton = document.getElementById('submit-theme');
        const progressContainer = document.getElementById('progress-container');
        const progressBar = document.getElementById('progress-bar');

        // Show progress bar
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        progressContainer.offsetHeight;
        await Utils.delay(20);

        let progress = 0;
        const loadingInterval = setInterval(() => {
            if (progress < 90) {
                progress += Math.random() * 10;
                progressBar.style.width = progress + '%';
            }
        }, 100);

        // Disable controls
        submitButton.disabled = true;
        themeInput.disabled = true;
        submitButton.innerText = "Submitting...";

        try {
            this.theme = theme;
            const words = await API.fetchWords(theme);
            const result = this.board.populateBoard(words, this.seed, true);
            const boardId = await API.saveBoard(this.gameState, theme, this.seed, null);
            
            this.gameState.boardId = boardId;
            this.ui.updateToggleButton(this.seed, theme, boardId);

            // Complete progress bar
            clearInterval(loadingInterval);
            progressBar.style.width = '100%';
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 300);

            // Initialize the scoreboard with score 
            this.ui.updateScore(0, 0, true);

            // Update URL and UI
            Utils.updateCurrentUrl(this.seed, theme, boardId);
            this.ui.updateToggleButton(this.seed, theme, boardId);
            this.ui.updateTurnDisplay(true);
            document.querySelector('.view-toggle').style.display = 'block';

            this.showGameUI();
        } catch (error) {
            clearInterval(loadingInterval);
            progressContainer.style.display = 'none';
            console.error("Error during theme submission:", error);
            this.ui.showErrorPopup(
                error.title || 'Error',
                error.userMessage || 'An error occurred while processing your theme.'
            );
        } finally {
            // Re-enable controls
            submitButton.disabled = false;
            themeInput.disabled = false;
            submitButton.innerText = "Submit";
        }
    }

    async handleShuffle() {
        if (!confirm("Are you sure? This will reset the game.")) {
            return;
        }
        
        this.gameState.gameEnded = false;

        // Generate a new random seed
        this.seed = Utils.generateSeed();

        // Reset game state
        this.gameState.resetGame();

        // Update the URL with the new seed
        const urlParams = Utils.getUrlParams();
        urlParams.set('seed', this.seed);
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState(null, '', newUrl);

        // Re-populate the board with new seed
        const result = this.board.populateBoard(this.gameState.currentWords, this.seed, true);
        const boardId = await API.saveBoard(this.gameState, this.theme, this.seed, null);

        this.gameState.boardId = boardId;
        Utils.updateCurrentUrl(this.seed, this.theme, boardId);

        // Update UI
        this.ui.updateScore(0, 0, true);
        this.ui.updateTurnDisplay(true);
        this.ui.updateShuffleButton();

        console.log(`New seed used: ${this.seed}`);
    }

    handleNewTheme() {
        if (!confirm("Are you sure? This will return to the theme submission page.")) {
            return;
        }

        // Reset the URL to remove query parameters
        window.history.replaceState(null, '', window.location.pathname);

        this.showThemeInput();
        this.ui.updateScore(0, 0, false);
    }

    async handleUndo() {
        if (this.gameState.gameStateHistory.length === 0) return;
        
        if (!confirm("Are you sure you want to undo the last move?")) {
            return;
        }
        
        if (this.gameState.undoLastMove()) {
            this.ui.restoreUIState();
            this.ui.updateUndoButton();
            
            // Save restored state to backend
            await API.saveBoard(this.gameState, this.theme, this.seed, this.gameState.boardId);
        }
    }

    setupEventListeners() {
        // Theme submission
        const submitButton = document.getElementById('submit-theme');
        const themeInput = document.getElementById('theme');

        submitButton.addEventListener('click', () => this.handleThemeSubmission());
        themeInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.handleThemeSubmission();
            }
        });

        // Game buttons
        const newThemeButton = document.getElementById('new-theme-button');
        const shuffleButton = document.getElementById('shuffle-button');
        const undoButton = document.getElementById('undo-button');

        if (newThemeButton) {
            newThemeButton.addEventListener('click', (event) => {
                event.preventDefault();
                this.handleNewTheme();
            });
        }

        if (shuffleButton) {
            shuffleButton.addEventListener('click', (event) => {
                event.preventDefault();
                this.handleShuffle();
            });
        }

        if (undoButton) {
            undoButton.addEventListener('click', (event) => {
                event.preventDefault();
                this.handleUndo();
            });
        }

        // Help modal
        this.setupHelpModal();

        // Initially hide game buttons
        this.ui.toggleBoardButtons(false);
    }

    setupHelpModal() {
        const helpButton = document.getElementById('help-button');
        const helpModal = document.getElementById('help-modal');
        const helpModalClose = document.getElementById('help-modal-close');

        if (helpButton) {
            helpButton.addEventListener('click', (event) => {
                event.preventDefault();
                helpModal.style.display = 'block';
            });
        }

        if (helpModalClose) {
            helpModalClose.addEventListener('click', () => {
                helpModal.style.display = 'none';
            });
        }
        
        // Close the modal when clicking outside of the modal content
        window.addEventListener('click', (event) => {
            if (event.target === helpModal) {
                helpModal.style.display = 'none';
            }
        });
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CodeNamesGame();
});