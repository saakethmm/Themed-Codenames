import { hinduWords } from './hinduwords.js';

export class Board {
    constructor(gameState, uiManager, api) {
        this.gameState = gameState;
        this.ui = uiManager;
        this.api = api;
    }

    // Seeded random number generator that returns both value and next seed
    seededRandom(seed) {
        const m = 0x80000000; // 2**31
        const a = 1103515245;
        const c = 12345;
        const nextSeed = (seed * a + c) % m;
        return {
            value: nextSeed / (m - 1),
            nextSeed: nextSeed
        };
    }

    // Seeded shuffle function
    shuffle(array, seed) {
        let currentSeed = seed;
        const result = [...array]; // Create a copy of the array
        let currentIndex = result.length;

        while (currentIndex !== 0) {
            // Generate a new seeded random index
            const randomResult = this.seededRandom(currentSeed);
            const randomIndex = Math.floor(randomResult.value * currentIndex);
            currentIndex--;

            // Swap with the current element
            [result[currentIndex], result[randomIndex]] = [result[randomIndex], result[currentIndex]];

            // Update the seed for the next iteration
            currentSeed = randomResult.nextSeed;
        }
        return result;
    }

    populateBoard(words, seed, shouldShuffle = true) {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = ''; // Clear existing board

        let shuffledWords, colors;
        
        if (shouldShuffle) {
            // Make sure we have an array of words
            let wordArray = words;
            if (typeof words === 'string') {
                wordArray = words.split(',').map(word => word.trim());
            }

            console.log("Words for board:", wordArray);

            // Make sure we have enough words
            if (wordArray.length < 25) {
                console.warn("Not enough words, padding with default words");
                wordArray = [...wordArray, ...hinduWords.slice(0, 25 - wordArray.length)];
            }

            // Shuffle the words and colors for new game
            shuffledWords = this.shuffle(wordArray, seed).slice(0, 25); // Shuffle words
            
            // Store current words for future use
            this.gameState.currentWords = [...shuffledWords];
            colors = this.shuffle(
                Array(9).fill('rgba(255, 0, 0, 0.7)') // 9 red cards
                .concat(Array(8).fill('rgba(0, 0, 255, 0.7)')) // 8 blue cards
                .concat(Array(7).fill('rgba(128, 128, 128, 0.7)')) // 7 neutral cards
                .concat(['black']), // 1 bomb card
                seed
            ); // Shuffle colors

            // Store colors for undo functionality
            this.gameState.currentColors = [...colors];
        } else {
            // Use existing words and colors (for view switching)
            shuffledWords = [...this.gameState.currentWords];
            colors = [...this.gameState.currentColors];
        }

        if (shouldShuffle) {
            this.gameState.resetGame();
        }

        shuffledWords.forEach((word, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerText = word;

            // Restore revealed state if card was already revealed
            if (this.gameState.revealed[index]) {
                card.style.backgroundColor = colors[index];
                card.classList.add('revealed');
                if (colors[index] === 'black') {
                    card.style.color = 'white';
                }
            }

            // Add click event to reveal color
            card.addEventListener('click', () => {
                if (this.gameState.gameEnded) return; // Prevent clicks if the game has ended

                if (!card.classList.contains('revealed')) { // Avoid re-clicking
                    // Save current game state before making changes
                    this.gameState.saveGameState();
                    
                    const color = colors[index];
                    card.style.backgroundColor = color;
                    card.classList.add('revealed');
                    this.gameState.revealed[index] = true;

                    // Handle game logic
                    const result = this.gameState.handleCardClick(color);

                    // Update UI based on result
                    if (result.gameEnded) {
                        if (color === 'black') {
                            card.style.color = 'white'; // Make text visible on dark background
                        }
                        
                        // Update score display for win condition (bomb or normal win)
                        this.ui.updateScore(this.gameState.scores['rgba(0, 0, 255, 0.7)'], this.gameState.scores['rgba(255, 0, 0, 0.7)'], true, result.winner);
                        
                        this.ui.updateTurnDisplay(false);
                        this.ui.updateShuffleButton();
                    } else {
                        // Update score
                        if (color === 'rgba(255, 0, 0, 0.7)') {
                            this.ui.updateScore(this.gameState.scores['rgba(0, 0, 255, 0.7)'], this.gameState.scores[color], true);
                        } else if (color === 'rgba(0, 0, 255, 0.7)') {
                            this.ui.updateScore(this.gameState.scores[color], this.gameState.scores['rgba(255, 0, 0, 0.7)'], true);
                        }

                        // Update turn display
                        this.ui.updateTurnDisplay(true);
                    }

                    // Update undo button
                    this.ui.updateUndoButton();
                }
            });

            // Add right-click event to show context menu
            card.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                this.showCardContextMenu(event, card, word);
            });

            boardElement.appendChild(card);
        });

        return { words: shuffledWords, colors: colors };
    }

    showCardContextMenu(event, card, originalWord) {
        // Remove any existing custom context menu
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) existingMenu.remove();

        // Create a custom context menu
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.top = `${event.clientY}px`;
        menu.style.left = `${event.clientX}px`;

        // Add "Edit Card" option
        const editOption = document.createElement('div');
        editOption.className = 'context-menu-item';
        editOption.innerText = 'Edit Card';
        editOption.addEventListener('click', () => {
            // Remove the context menu
            menu.remove();

            // Create an input field for editing
            const input = document.createElement('input');
            input.type = 'text';
            input.value = card.innerText;
            input.className = 'card-input';

            // Replace card text with input field
            card.innerHTML = '';
            card.appendChild(input);
            input.focus();

            // Save the new text when the user presses "Enter" or clicks outside
            const saveText = () => {
                card.innerText = input.value.trim() || originalWord;
                card.classList.remove('editing');
            };

            input.addEventListener('blur', saveText);
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    saveText();
                }
            });
        });

        menu.appendChild(editOption);
        document.body.appendChild(menu);

        // Remove the context menu when clicking elsewhere
        document.addEventListener('click', () => menu.remove(), { once: true });
    }
}