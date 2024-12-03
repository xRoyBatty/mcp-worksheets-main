export class ProgressManager {
    constructor() {
        this.storage = window.localStorage;
        this.currentUser = null;
    }

    setUser(userId) {
        this.currentUser = userId;
    }

    saveProgress(worksheetId, progress) {
        if (!this.currentUser) return;

        const key = `progress_${this.currentUser}_${worksheetId}`;
        const data = {
            progress,
            timestamp: new Date().toISOString(),
            attempts: this.getAttempts(worksheetId) + 1
        };

        this.storage.setItem(key, JSON.stringify(data));
    }

    getProgress(worksheetId) {
        if (!this.currentUser) return null;

        const key = `progress_${this.currentUser}_${worksheetId}`;
        const data = this.storage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    getAttempts(worksheetId) {
        const progress = this.getProgress(worksheetId);
        return progress ? progress.attempts : 0;
    }
} 