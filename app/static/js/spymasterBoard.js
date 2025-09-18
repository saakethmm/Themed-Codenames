import { hinduWords } from './hinduwords.js';

export class SpymasterBoard {
    constructor(api) {
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

    async initializeBoard(seed, theme, boardId) {
        let boardWords;
        let colors;
        
        if (boardId) {
            try {
                const data = await this.api.loadBoard(boardId);
                boardWords = data.words;
                colors = data.colors;
                
                console.log("Loaded board from board_id:", boardId);
                return { words: boardWords, colors: colors, loadedTheme: data.theme, loadedSeed: data.seed };
            } catch (error) {
                console.error("Error fetching board:", error);
                throw new Error(`Unable to load board with ID "${boardId}". Please check your internet connection and try again.`);
            }
        }

        // Only generate new board if we don't have existing board data
        if (!boardWords) {
            if (theme) {
                try {
                    const fetchedWords = await this.api.fetchWords(theme);
                    boardWords = this.shuffle(fetchedWords, seed).slice(0, 25); // Shuffle words
                } catch (error) {
                    // Re-throw with context for spymaster
                    throw error;
                }
            } else {
                boardWords = this.shuffle(hinduWords.slice(), seed).slice(0, 25); // Shuffle words
            }
        }

        // Only generate new colors if we don't have existing colors
        if (!colors) {
            colors = this.shuffle(
                Array(9).fill('rgba(255, 0, 0, 0.7)')
                .concat(Array(8).fill('rgba(0, 0, 255, 0.7)'))
                .concat(Array(7).fill('rgba(128, 128, 128, 0.7)'))
                .concat(['black']), 
                seed
            ); // Shuffle colors
        }

        return { words: boardWords, colors: colors };
    }

    populateBoard(words, colors) {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = ''; // Clear existing board

        words.forEach((word, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerText = word;

            // Set background color immediately for the spymaster view
            card.style.backgroundColor = colors[index];
            if (colors[index] === 'black') {
                card.style.color = 'white'; // Make text visible on dark background
            }

            boardElement.appendChild(card);
        });
    }
}