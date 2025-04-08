import { hinduWords } from './hinduwords.js';

// RANDOM SEED LOGIC

// Shared seed logic
const urlParams = new URLSearchParams(window.location.search);
let seed = urlParams.get('seed');
let theme = urlParams.get('theme');

if (!seed) {
    seed = Math.floor(Math.random() * 10000); // Generate a random seed
    urlParams.set('seed', seed);

    // Update the URL without reloading the page
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState(null, '', newUrl);
}

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
    try {
        const response = await fetch('/get_words', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ theme: theme })
        });

        if (response.ok) {
            const data = await response.json();
            return data.words.split(', '); // Convert comma-separated string to array
        } else {
            console.error('Failed to fetch words');
            return hinduWords; // Fallback to default words
        }
    } catch (error) {
        console.error('Error fetching words:', error);
        return hinduWords; // Fallback to default words
    }
}

async function initializeBoard() {
    let boardWords;
    
    // If theme is provided in URL, fetch those words
    if (theme) {
        const fetchedWords = await fetchWords(theme);
        boardWords = shuffle(fetchedWords, seed).slice(0, 25); // Shuffle words
    } else {
        // Otherwise use default words
        boardWords = shuffle(hinduWords.slice(), seed).slice(0, 25); // Shuffle words
    }

    const colors = shuffle(Array(9).fill('rgba(255, 0, 0, 0.7)')
        .concat(Array(8).fill('rgba(0, 0, 255, 0.7)'))
        .concat(Array(7).fill('rgba(128, 128, 128, 0.7)'))
        .concat(['black']), seed); // Shuffle colors

    // Populate the board with colors revealed
    const boardElement = document.getElementById('board');
    boardWords.forEach((word, index) => {
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

// Update the toggle button to include the current seed and theme
function updateToggleButton() {
    const toggleButton = document.getElementById('view-toggle');
    if (toggleButton) {
        const currentHref = toggleButton.getAttribute('href').split('?')[0];
        
        let newUrl = `${currentHref}?seed=${seed}`;
        if (theme) {
            newUrl += `&theme=${encodeURIComponent(theme)}`;
        }
        
        toggleButton.setAttribute('href', newUrl);
    }
}

// Call functions when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await initializeBoard();
    updateToggleButton();
});