export class GameState {
    constructor() {
        this.scores = {
            'rgba(255, 0, 0, 0.7)': 0, // Red
            'rgba(0, 0, 255, 0.7)': 0, // Blue
        };
        this.currentTurn = 'Red';
        this.gameEnded = false;
        this.revealed = {};
        this.gameStateHistory = [];
        this.currentWords = [];
        this.currentColors = [];
        this.boardId = null;
    }

    saveGameState() {
        const state = {
            revealed: { ...this.revealed },
            scores: { ...this.scores },
            currentTurn: this.currentTurn,
            gameEnded: this.gameEnded
        };
        this.gameStateHistory.push(state);
        
        // Limit history to last 10 moves to prevent memory issues
        if (this.gameStateHistory.length > 10) {
            this.gameStateHistory.shift();
        }
        
        return this.gameStateHistory.length;
    }

    undoLastMove() {
        if (this.gameStateHistory.length === 0) return false;
        
        const previousState = this.gameStateHistory.pop();
        
        // Restore game state
        this.revealed = { ...previousState.revealed };
        this.scores = { ...previousState.scores };
        this.currentTurn = previousState.currentTurn;
        this.gameEnded = previousState.gameEnded;
        
        return true;
    }

    resetGame() {
        this.scores = {
            'rgba(255, 0, 0, 0.7)': 0, // Red
            'rgba(0, 0, 255, 0.7)': 0, // Blue
        };
        this.currentTurn = 'Red';
        this.gameEnded = false;
        this.revealed = {};
        this.gameStateHistory = [];
    }

    handleCardClick(color) {
        // Update score
        if (color === 'rgba(255, 0, 0, 0.7)') {
            this.scores[color]++;
        } else if (color === 'rgba(0, 0, 255, 0.7)') {
            this.scores[color]++;
        }

        // Switch turns if necessary
        if (
            (this.currentTurn === 'Red' && (color === 'rgba(0, 0, 255, 0.7)' || color === 'rgba(128, 128, 128, 0.7)')) ||
            (this.currentTurn === 'Blue' && (color === 'rgba(255, 0, 0, 0.7)' || color === 'rgba(128, 128, 128, 0.7)'))
        ) {
            this.currentTurn = this.currentTurn === 'Red' ? 'Blue' : 'Red';
        }

        // Check for game end conditions
        if (color === 'black') {
            this.gameEnded = true;
            return { gameEnded: true, winner: this.currentTurn === 'Red' ? 'Blue' : 'Red' };
        } else if (this.scores['rgba(0, 0, 255, 0.7)'] >= 8) {
            this.gameEnded = true;
            return { gameEnded: true, winner: 'Blue' };
        } else if (this.scores['rgba(255, 0, 0, 0.7)'] >= 9) {
            this.gameEnded = true;
            return { gameEnded: true, winner: 'Red' };
        }

        return { gameEnded: false };
    }

    getSerializableState() {
        return {
            scores: this.scores,
            currentTurn: this.currentTurn,
            gameEnded: this.gameEnded,
            revealed: this.revealed,
            words: this.currentWords,
            colors: this.currentColors
        };
    }

    loadState(data) {
        if (data.scores) this.scores = data.scores;
        if (data.currentTurn) this.currentTurn = data.currentTurn;
        if (data.gameEnded !== undefined) this.gameEnded = data.gameEnded;
        if (data.revealed) this.revealed = data.revealed;
        if (data.words) this.currentWords = data.words;
        if (data.colors) this.currentColors = data.colors;
    }
}