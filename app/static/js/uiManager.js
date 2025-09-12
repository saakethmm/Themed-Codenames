export class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
    }

    showErrorPopup(title, message) {
        // Remove any existing error popup
        const existingPopup = document.querySelector('.error-popup');
        if (existingPopup) existingPopup.remove();

        // Create popup elements
        const overlay = document.createElement('div');
        overlay.className = 'error-popup-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const popup = document.createElement('div');
        popup.className = 'error-popup';
        popup.style.cssText = `
            background: white;
            border-radius: 10px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            text-align: center;
            font-family: Arial, sans-serif;
        `;

        const titleElement = document.createElement('h2');
        titleElement.style.cssText = `
            color: #d32f2f;
            margin: 0 0 15px 0;
            font-size: 24px;
        `;
        titleElement.textContent = title;

        const messageElement = document.createElement('p');
        messageElement.style.cssText = `
            color: #333;
            margin: 0 0 25px 0;
            font-size: 16px;
            line-height: 1.5;
        `;
        messageElement.textContent = message;

        const closeButton = document.createElement('button');
        closeButton.style.cssText = `
            background-color: #d32f2f;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        `;
        closeButton.textContent = 'OK';

        // Close popup when button is clicked
        closeButton.addEventListener('click', () => {
            overlay.remove();
        });

        // Close popup when clicking outside
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        // Assemble popup
        popup.appendChild(titleElement);
        popup.appendChild(messageElement);
        popup.appendChild(closeButton);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    }

    updateTurnDisplay(gameStarted = false) {
        const turnElement = document.getElementById('turn');
        if (turnElement) {
            if (!gameStarted) {
                turnElement.style.display = 'none';
                return;
            }
            turnElement.style.display = 'block';
            turnElement.innerHTML = `
                <span style="color: ${this.gameState.currentTurn.toLowerCase()}; font-weight: bold;">${this.gameState.currentTurn}'s Turn</span>
            `;
        } else {
            console.error('Turn element not found!');
        }
    }

    updateScore(blue, red, gameStarted = false) {
        const scoreElement = document.getElementById('score');
        if (!scoreElement) {
            console.error('Score element not found!');
            return;
        }

        if (!gameStarted) {
            scoreElement.innerHTML = `
                <span style="font-size: 2rem; font-weight: bold;">🔎 Themed Codenames Generator</span>
            `;
            this.updateShuffleButton();
            return;
        }

        if (blue >= 8) {
            scoreElement.innerHTML = `<span style="font-size: 3rem; color: blue; font-weight: bold;">Blue Wins!</span>`;
            this.updateTurnDisplay(false);
            this.gameState.gameEnded = true;
            this.updateShuffleButton();
            return;
        } else if (red >= 9) {
            scoreElement.innerHTML = `<span style="font-size: 3rem; color: red; font-weight: bold;">Red Wins!</span>`;
            this.gameState.gameEnded = true;
            this.updateShuffleButton();
            return;
        }

        scoreElement.innerHTML = `
            <span style="color: red; font-weight: bold;">${red}</span> -
            <span style="color: blue; font-weight: bold;">${blue}</span>
        `;
        this.updateShuffleButton();
    }

    updateShuffleButton() {
        const shuffleButton = document.getElementById('shuffle-button');
        if (!shuffleButton) return;
        shuffleButton.textContent = this.gameState.gameEnded ? "▶️ Play Again?" : "🔀 Shuffle";
    }

    updateUndoButton() {
        const undoButton = document.getElementById('undo-button');
        if (undoButton) {
            const shouldShow = this.gameState.gameStateHistory.length > 0;
            undoButton.style.display = shouldShow ? 'inline-block' : 'none';
            console.log('Undo button visibility:', shouldShow, 'History length:', this.gameState.gameStateHistory.length);
        } else {
            console.log('Undo button element not found');
        }
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

    restoreUIState() {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            if (this.gameState.revealed[index]) {
                card.style.backgroundColor = this.gameState.currentColors[index];
                card.classList.add('revealed');
                if (this.gameState.currentColors[index] === 'black') {
                    card.style.color = 'white';
                }
            } else {
                card.style.backgroundColor = '';
                card.classList.remove('revealed');
                card.style.color = '';
            }
        });
        
        // Update score display
        this.updateScore(this.gameState.scores['rgba(0, 0, 255, 0.7)'], this.gameState.scores['rgba(255, 0, 0, 0.7)'], true);
        
        // Update turn display
        if (this.gameState.gameEnded) {
            this.updateTurnDisplay(false);
        } else {
            this.updateTurnDisplay(true);
        }
    }

    toggleBoardButtons(show) {
        const display = show ? 'block' : 'none';
        const newThemeButton = document.querySelector('.new-theme');
        const shuffleButton = document.querySelector('.shuffle');
        const helpButton = document.querySelector('.help');
        const undoButtonContainer = document.querySelector('.undo');
        
        if (newThemeButton) newThemeButton.style.display = display;
        if (shuffleButton) shuffleButton.style.display = display;
        if (helpButton) helpButton.style.display = display;
        if (undoButtonContainer) undoButtonContainer.style.display = display;
        
        // If showing buttons, update undo button visibility based on history
        if (show) {
            this.updateUndoButton();
        }
    }
}