export class API {
    static async fetchWords(theme) {
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
                const errorMessage = `Unable to fetch words for theme "${theme}". Please check your internet connection and try again.`;
                // Import is not available here, so we'll throw with details for the caller to handle
                const error = new Error('Failed to fetch words from server');
                error.userMessage = errorMessage;
                error.title = 'Failed to Load Theme';
                throw error;
            }
        } catch (error) {
            console.error('Error fetching words:', error);
            if (!error.userMessage) {
                error.userMessage = `Unable to connect to the server while fetching theme "${theme}". Please check your internet connection and try again.`;
                error.title = 'Network Error';
            }
            throw error;
        }
    }

    static async saveBoard(gameState, theme, seed, boardId = null) {
        try {
            const response = await fetch('/save_board', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    board_id: boardId,
                    theme,
                    seed,
                    ...gameState.getSerializableState()
                })
            });

            const result = await response.json();
            return result.board_id;
        } catch (error) {
            console.error("Failed to save board to backend:", error);
            return null;
        }
    }

    static async loadBoard(boardId) {
        try {
            const response = await fetch(`/get_board?board_id=${boardId}`);
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error("Board not found");
            }
        } catch (error) {
            console.error("Error loading board:", error);
            throw error;
        }
    }
}