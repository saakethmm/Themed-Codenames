import { hinduWords } from './hinduwords.js';

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

const seed = 3; // Shared seed for consistency

const boardWords = shuffle(hinduWords.slice(), seed).slice(0, 25); // Shuffle words
const colors = shuffle(Array(9).fill('rgba(255, 0, 0, 0.7)')
    .concat(Array(8).fill('rgba(0, 0, 255, 0.7)'))
    .concat(Array(7).fill('rgba(128, 128, 128, 0.7)'))
    .concat(['black']), seed); // Shuffle colors

// Initialize scores
let scores = {
    'rgba(255, 0, 0, 0.7)': 0, // Red
    'rgba(0, 0, 255, 0.7)': 0, // Blue
    'rgba(128, 128, 128, 0.7)': 0, // Neutral
    'black': 0 // Bomb
};

let textColor = {
    'red': 'rgba(255, 0, 0, 0.7)',
    'blue': 'rgba(0, 0, 255, 0.7)',
    'neutral': 'rgba(128, 128, 128, 0.7)',
    'black': 'black'
}

let currentTurn = 'red'; // Start with red's turn

function updateTurnDisplay() {
    const turnElement = document.getElementById('turn');
    if (turnElement) {
        turnElement.innerHTML = `
            <span style="color: ${currentTurn}; font-weight: bold;">${currentTurn.toUpperCase()}'s Turn</span>
        `;
    } else {
        console.error('Turn element not found!');
    }
}

// Populate the board
const boardElement = document.getElementById('board');
boardWords.forEach((word, index) => {
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
                (currentTurn === 'red' && (color === 'rgba(0, 0, 255, 0.7)' || color === 'rgba(128, 128, 128, 0.7)')) ||
                (currentTurn === 'blue' && (color === 'rgba(255, 0, 0, 0.7)' || color === 'rgba(128, 128, 128, 0.7)'))
            ) {
                currentTurn = currentTurn === 'red' ? 'blue' : 'red';
                updateTurnDisplay();
            }

            // If the bomb (dark tile) is clicked, add special handling
            if (color === 'black') {
                card.style.color = 'white'; // Make text visible on dark background
                alert("Bomb tile! Game over.");
            }
        }
    });

    boardElement.appendChild(card);
});

// function updateScoreboard() {
//     const redScore = scores['rgba(255, 0, 0, 0.7)'];
//     const blueScore = scores['rgba(0, 0, 255, 0.7)'];
//     document.getElementById('score').innerText = `${redScore}-${blueScore}`;
// }

// Initialize scores
let blueScore = 0;
let redScore = 0;

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
});