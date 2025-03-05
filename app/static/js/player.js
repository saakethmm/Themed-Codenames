import { hinduWords } from './hinduwords.js';

// RANDOM SEED LOGIC

const urlParams = new URLSearchParams(window.location.search);
let seed = Math.floor(Math.random() * 10000); // Generate a random seed
urlParams.set('seed', seed);

// Update the URL without reloading the page
const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
window.history.replaceState(null, '', newUrl);

console.log(`Seed used: ${seed}`); // Log the seed

/* ---------------------------------------------------------------- */

// Seeded random number generator
function seededRandom(seed) {
    let m = 0x80000000; // 2**31
    let a = 1103515245;
    let c = 12345;
    seed = (seed * a + c) % m;
    return seed / (m - 1);
}

// Seeded shuffle function
function shuffle(array, seed) {
    let currentIndex = array.length;
    let randomIndex;

    while (currentIndex !== 0) {
        // Generate a new seeded random index
        randomIndex = Math.floor(seededRandom(seed) * currentIndex);
        currentIndex--;

        // Swap with the current element
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];

        // Update the seed for the next iteration
        seed++;
    }
    return array;
}

// Function to fetch words from the backend
async function fetchWords(theme) {
    const response = await fetch('/get_words', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ theme: theme })
    });

    if (response.ok) {
        const data = await response.json();
        return data.words;
    } else {
        console.error('Failed to fetch words');
        return [];
    }
}

// Function to populate the board with words
function populateBoard(words) {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = ''; // Clear existing board

    const shuffledWords = shuffle(words.slice(), seed).slice(0, 25); // Shuffle words
    const colors = shuffle(Array(9).fill('rgba(255, 0, 0, 0.7)')
        .concat(Array(8).fill('rgba(0, 0, 255, 0.7)'))
        .concat(Array(7).fill('rgba(128, 128, 128, 0.7)'))
        .concat(['black']), seed); // Shuffle colors

    shuffledWords.forEach((word, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = word;

        // Add click event to reveal color
        card.addEventListener('click', () => {
            if (!card.classList.contains('revealed')) { // Avoid re-clicking
                const color = colors[index];
                card.style.backgroundColor = color;
                card.classList.add('revealed');

                // Update score
                if (color !== 'rgba(128, 128, 128, 0.7)') { // Ignore neutral color
                    scores[color]++;
                    updateScore(scores[textColor['blue']], scores[textColor['red']]);
                }

                // Switch turns if necessary
                if (
                    (currentTurn === 'Red' && (color === 'rgba(0, 0, 255, 0.7)' || color === 'rgba(128, 128, 128, 0.7)')) ||
                    (currentTurn === 'Blue' && (color === 'rgba(255, 0, 0, 0.7)' || color === 'rgba(128, 128, 128, 0.7)'))
                ) {
                    currentTurn = currentTurn === 'Red' ? 'Blue' : 'Red';
                    console.log(`Turn changed to: ${currentTurn.toUpperCase()}`); // Log the new turn
                    updateTurnDisplay();
                }

                // If the bomb (dark tile) is clicked, add special handling
                if (color === 'black') {
                    card.style.color = 'white'; // Make text visible on dark background
                    const winningTeam = currentTurn === 'Red' ? 'Blue' : 'Red';
                    
                    // Immediately trigger the other team winning
                    const scoreboardElement = document.querySelector('.scoreboard');
                    scoreboardElement.innerHTML = `
                        <span style="font-size: 3rem; color: ${winningTeam}; font-weight: bold;">
                            ${winningTeam} Wins!
                        </span>
                    `;
                    return; // Stop further execution
                }
            }
        });

        boardElement.appendChild(card);
    });
}

// Initialize scores
let scores = {
    'rgba(255, 0, 0, 0.7)': 0, // Red
    'rgba(0, 0, 255, 0.7)': 0, // Blue
    'rgba(128, 128, 128, 0.7)': 0, // Neutral
    'black': 0 // Bomb
};

// Dictionary to map team colors to their respective scores
let textColor = {
    'red': 'rgba(255, 0, 0, 0.7)',
    'blue': 'rgba(0, 0, 255, 0.7)'
}

// Update turn display
let currentTurn = 'Red'; // Start with red's turn

function updateTurnDisplay() {
    const turnElement = document.getElementById('turn');
    if (turnElement) {
        turnElement.innerHTML = `
            <span style="color: ${currentTurn}; font-weight: bold;">${currentTurn}'s Turn</span>
        `;
        console.log(`Current turn: ${currentTurn.toUpperCase()}`);
    } else {
        console.error('Turn element not found!');
    }
}

// Function to update the scoreboard
function updateScore(blue, red) {
    blueScore = blue;
    redScore = red;

    const scoreboardElement = document.querySelector('.scoreboard');
    
    // Check if blue or red wins
    if (blueScore >= 8) {
        scoreboardElement.innerHTML = `<span style="font-size: 3rem; color: blue; font-weight: bold;">Blue Wins!</span>`;
        return;
    } else if (redScore >= 9) {
        scoreboardElement.innerHTML = `<span style="font-size: 3rem; color: red; font-weight: bold;">Red Wins!</span>`;
        return;
    }

    // Update score display
    const scoreElement = document.getElementById('score');
    scoreElement.innerHTML = `
        <span style="color: red; font-weight: bold;">${red}</span> -
        <span style="color: blue; font-weight: bold;">${blue}</span>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    updateScore(0, 0); // Initialize the scoreboard with 0-0
    updateTurnDisplay(); // Initialize the turn display

    // Handle theme submission
    const submitButton = document.getElementById('submit-theme');
    submitButton.addEventListener('click', async () => {
        const themeInput = document.getElementById('theme');
        const theme = themeInput.value.trim();
        if (theme) {
            const words = await fetchWords(theme);
            populateBoard(words);
        } else {
            alert('Please enter a theme');
        }
    });
});