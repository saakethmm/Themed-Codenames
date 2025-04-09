// Fixed player.js file
import { hinduWords } from './hinduwords.js';

// RANDOM SEED LOGIC
const urlParams = new URLSearchParams(window.location.search);
let seed = urlParams.get('seed');

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
    let currentSeed = seed;
    const result = [...array]; // Create a copy of the array
    let currentIndex = result.length;
    let randomIndex;

    while (currentIndex !== 0) {
        // Generate a new seeded random index
        randomIndex = Math.floor(seededRandom(currentSeed) * currentIndex);
        currentIndex--;

        // Swap with the current element
        [result[currentIndex], result[randomIndex]] = [result[randomIndex], result[currentIndex]];

        // Update the seed for the next iteration
        currentSeed++;
    }
    return result;
}

// Function to fetch words from the backend
async function fetchWords(theme) {
    try {
        const response = await fetch(`/get_words?theme=${encodeURIComponent(theme)}`, {
            method: 'GET',
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Fetched words:", data);
            
            // Convert comma-separated string to array if needed
            if (typeof data.words === 'string') {
                return data.words.split(',').map(word => word.trim());
            }
            return data.words;
        } else {
            console.error('Failed to fetch words from server');
            return hinduWords; // Fallback to default words
        }
    } catch (error) {
        console.error('Error fetching words:', error);
        return hinduWords; // Fallback to default words
    }
}

// Initialize scores and game state
let scores = {
    'rgba(255, 0, 0, 0.7)': 0, // Red
    'rgba(0, 0, 255, 0.7)': 0, // Blue
};
let currentTurn = 'Red'; // Start with red's turn

// Function to populate the board with words
function populateBoard(words) {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = ''; // Clear existing board

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

    const shuffledWords = shuffle(wordArray, seed).slice(0, 25); // Shuffle words
    const colors = shuffle(
        Array(9).fill('rgba(255, 0, 0, 0.7)') // 9 red cards
        .concat(Array(8).fill('rgba(0, 0, 255, 0.7)')) // 8 blue cards
        .concat(Array(7).fill('rgba(128, 128, 128, 0.7)')) // 7 neutral cards
        .concat(['black']), // 1 bomb card
        seed
    ); // Shuffle colors

    // Reset scores
    scores = {
        'rgba(255, 0, 0, 0.7)': 0, // Red
        'rgba(0, 0, 255, 0.7)': 0, // Blue
    };

    // Update score display
    updateScore(0, 0);

    // Reset current turn to Red
    currentTurn = 'Red';
    updateTurnDisplay();

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
                if (color === 'rgba(255, 0, 0, 0.7)') {
                    scores[color]++;
                    updateScore(scores['rgba(0, 0, 255, 0.7)'], scores[color]);
                } else if (color === 'rgba(0, 0, 255, 0.7)') {
                    scores[color]++;
                    updateScore(scores[color], scores['rgba(255, 0, 0, 0.7)']);
                }

                // Switch turns if necessary
                if (
                    (currentTurn === 'Red' && (color === 'rgba(0, 0, 255, 0.7)' || color === 'rgba(128, 128, 128, 0.7)')) ||
                    (currentTurn === 'Blue' && (color === 'rgba(255, 0, 0, 0.7)' || color === 'rgba(128, 128, 128, 0.7)'))
                ) {
                    currentTurn = currentTurn === 'Red' ? 'Blue' : 'Red';
                    console.log(`Turn changed to: ${currentTurn}`);
                    updateTurnDisplay();
                }

                // If the bomb (black tile) is clicked, add special handling
                if (color === 'black') {
                    card.style.color = 'white'; // Make text visible on dark background
                    const winningTeam = currentTurn === 'Red' ? 'Blue' : 'Red';

                    // Immediately trigger the other team winning
                    const scoreboardElement = document.querySelector('.scoreboard');
                    scoreboardElement.innerHTML = `
                        <span style="font-size: 3rem; color: ${winningTeam.toLowerCase()}; font-weight: bold;">
                            ${winningTeam} Wins!
                        </span>
                    `;
                }
            }
        });

        // Add right-click event to show context menu
        card.addEventListener('contextmenu', (event) => {
            event.preventDefault(); // Prevent the default context menu

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
                    card.innerText = input.value.trim() || word; // Revert to original word if input is empty
                    card.classList.remove('editing');
                };

                input.addEventListener('blur', saveText); // Save on blur
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
        });

        boardElement.appendChild(card);
    });
}

// Update turn display
function updateTurnDisplay() {
    const turnElement = document.getElementById('turn');
    if (turnElement) {
        turnElement.innerHTML = `
            <span style="color: ${currentTurn.toLowerCase()}; font-weight: bold;">${currentTurn}'s Turn</span>
        `;
    } else {
        console.error('Turn element not found!');
    }
}

// Function to update the scoreboard
function updateScore(blue, red) {
    const scoreElement = document.getElementById('score');
    if (!scoreElement) {
        console.error('Score element not found!');
        return;
    }
    
    // Check if blue or red wins
    if (blue >= 8) {
        document.querySelector('.scoreboard').innerHTML = `
            <span style="font-size: 3rem; color: blue; font-weight: bold;">Blue Wins!</span>
        `;
        return;
    } else if (red >= 9) {
        document.querySelector('.scoreboard').innerHTML = `
            <span style="font-size: 3rem; color: red; font-weight: bold;">Red Wins!</span>
        `;
        return;
    }

    // Update score display
    scoreElement.innerHTML = `
        <span style="color: red; font-weight: bold;">${red}</span> -
        <span style="color: blue; font-weight: bold;">${blue}</span>
    `;
}

// Function to update the page title
function updateTitle(score) {
    const titleElement = document.querySelector('title');
    if (score) {
        titleElement.textContent = `Score: ${score}`;9
    } else {
        titleElement.textContent = "Welcome to Themed Codenames!";
    }
}

// Update the toggle button to include the current seed and theme
function updateToggleButton() {
    const toggleButton = document.getElementById('view-toggle');
    if (toggleButton) {
        const currentHref = toggleButton.getAttribute('href').split('?')[0];
        
        // Get the theme from the input field or URL parameter
        let theme = document.getElementById('theme').value.trim();
        if (!theme) {
            const urlParams = new URLSearchParams(window.location.search);
            theme = urlParams.get('theme');
        }
        
        let newUrl = `${currentHref}?seed=${seed}`;
        if (theme) {
            newUrl += `&theme=${encodeURIComponent(theme)}`;
        }
        
        toggleButton.setAttribute('href', newUrl);
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded');
    
    // Set the initial title
    updateTitle();

    // Initialize the scoreboard
    updateScore(0, 0); // Initialize the scoreboard with 0-0
    updateTurnDisplay(); // Initialize the turn display
    updateToggleButton(); // Update the toggle button with the current seed

    // Check if there's a theme parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get('theme');

    const newThemeButton = document.querySelector('.new-theme');
    const shuffleButton = document.querySelector('.shuffle');
    const themeInputBox = document.querySelector('.theme-input');
    const boardElement = document.querySelector('.board');

    // Function to toggle visibility of the "New Theme?" and "🔄 Shuffle" buttons
    function toggleBoardButtons(show) {
        if (show) {
            newThemeButton.style.display = 'block';
            shuffleButton.style.display = 'block';
        } else {
            newThemeButton.style.display = 'none';
            shuffleButton.style.display = 'none';
        }
    }

    // Hide the "New Theme?" and "🔄 Shuffle" buttons by default
    toggleBoardButtons(false);

    if (theme) {
        // Set the theme input value
        const themeInput = document.getElementById('theme');
        themeInput.value = theme;
        
        // Fetch words and populate board
        const words = await fetchWords(theme);
        populateBoard(words);

        // Update the title with the score after the board is loaded
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            updateTitle(scoreElement.textContent);
        }

        // Show the turn indicator and toggle button
        document.querySelector('.turn-indicator').style.display = 'block';
        document.querySelector('.view-toggle').style.display = 'block';
        
        // Hide the theme input box and show the "New Theme?" and "🔄 Shuffle" buttons
        themeInputBox.style.display = 'none';
        toggleBoardButtons(true);
    }

    // Handle theme submission
    const submitButton = document.getElementById('submit-theme');
    const themeInput = document.getElementById('theme');

    async function handleThemeSubmission() {
        const theme = themeInput.value.trim();
        if (theme) {
            // Disable the submit button and theme input field, and change the button text
            submitButton.disabled = true;
            themeInput.disabled = true;
            submitButton.innerText = "Submitting...";

            try {
                // Start fetching words
                const words = await fetchWords(theme);

                // Populate the board
                populateBoard(words);

                // Make sure the URL has our seed and theme
                const currentUrlParams = new URLSearchParams(window.location.search);
                currentUrlParams.set('seed', seed); // Ensure the seed is set
                currentUrlParams.set('theme', theme); // Add the theme
                const newUrl = `${window.location.pathname}?${currentUrlParams.toString()}`;
                window.history.replaceState(null, '', newUrl);

                // Update the toggle button with the current seed and theme
                updateToggleButton();

                // Show the turn indicator and toggle button
                document.querySelector('.turn-indicator').style.display = 'block';
                document.querySelector('.view-toggle').style.display = 'block';

                // Hide the theme input box and show the "New Theme?" and "🔄 Shuffle" buttons
                themeInputBox.style.display = 'none';
                toggleBoardButtons(true);
            } catch (error) {
                console.error("Error during theme submission:", error);
                alert("An error occurred while submitting the theme. Please try again.");
            } finally {
                // Re-enable the submit button and theme input field, and reset the button text
                submitButton.disabled = false;
                themeInput.disabled = false;
                submitButton.innerText = "Submit";
            }
        } else {
            alert('Please enter a theme');
        }
    }

    // Add click event listener to the submit button
    submitButton.addEventListener('click', handleThemeSubmission);

    // Add keydown event listener to the theme input field for "Enter" key
    themeInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default form submission behavior
            handleThemeSubmission();
        }
    });

    // Add functionality to the "New Theme?" button
    newThemeButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior

        // Show the theme input box
        themeInputBox.style.display = 'flex';

        // Hide the "New Theme?" and "🔄 Shuffle" buttons
        toggleBoardButtons(false);

        // Hide the board and other elements
        boardElement.innerHTML = ''; // Clear the board
        document.querySelector('.turn-indicator').style.display = 'none';
        document.querySelector('.view-toggle').style.display = 'none';
    });

    // Add functionality to the "🔄 Shuffle" button
    shuffleButton.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent default link behavior

        // Generate a new random seed
        seed = Math.floor(Math.random() * 10000);

        // Update the URL with the new seed
        urlParams.set('seed', seed);
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState(null, '', newUrl);

        // Re-populate the board with the new seed
        const words = await fetchWords(theme);
        populateBoard(words);

        console.log(`New seed used: ${seed}`); // Log the new seed
    });
});