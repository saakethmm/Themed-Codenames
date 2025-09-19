// utils.js
//
// Provides the Utils class with static helper methods for URL management, seed generation, and async delays in the Themed Codenames application.

export class Utils {
    static updateCurrentUrl(seed, theme, boardId) {
        const currentUrlParams = new URLSearchParams(window.location.search);
        currentUrlParams.set('seed', seed);
        
        if (theme) {
            currentUrlParams.set('theme', theme);
        }
        if (boardId) {
            currentUrlParams.set('board_id', boardId);
        }
        
        const newUrl = `${window.location.pathname}?${currentUrlParams.toString()}`;
        window.history.replaceState(null, '', newUrl);
        console.log("Updated URL:", newUrl);
    }

    static getUrlParams() {
        return new URLSearchParams(window.location.search);
    }

    static generateSeed() {
        return Math.floor(Math.random() * 10000);
    }

    static async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}