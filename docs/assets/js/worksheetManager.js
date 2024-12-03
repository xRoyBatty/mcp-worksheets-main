import { ProgressManager } from './progressManager.js';

export class WorksheetManager {
    constructor() {
        this.tasks = new Map();
        this.progressManager = new ProgressManager();
        this.init();
    }

    async init() {
        // Find progress elements
        this.progressBar = document.querySelector('.progress-bar');
        this.progressText = document.querySelector('.progress-text');

        // Load tasks
        const taskElements = document.querySelectorAll('.task-container');
        for (const element of taskElements) {
            // Get the task type from the third class
            const taskType = Array.from(element.classList)
                .find(cls => !['task-container', 'task'].includes(cls))
                ?.replace('-', '');
            
            if (!taskType) continue;

            try {
                const TaskModule = await import(`./tasks/${taskType}.js`);
                const task = new TaskModule.default(element);
                this.tasks.set(taskType, task);
            } catch (error) {
                console.error(`Failed to load task: ${taskType}`, error);
            }
        }

        // Setup buttons
        document.getElementById('check')?.addEventListener('click', () => this.checkAnswers());
        document.getElementById('retry')?.addEventListener('click', () => this.reset());

        // Initialize user
        const userId = this.getUserId();
        if (userId) {
            this.progressManager.setUser(userId);
            this.loadSavedProgress();
        } else {
            this.promptForUserId();
        }
    }

    getUserId() {
        // Try to get stored user ID
        const userId = localStorage.getItem('userId');
        if (userId) return userId;

        // For development, generate a random ID if none exists
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const devId = 'dev_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', devId);
            return devId;
        }

        return null;
    }

    promptForUserId() {
        // Simple prompt for user identification
        // In production, this should be replaced with proper authentication
        const userId = prompt('Please enter your student ID or email:');
        if (userId) {
            localStorage.setItem('userId', userId);
            this.progressManager.setUser(userId);
        }
    }

    getWorksheetId() {
        // Generate a unique ID for this worksheet based on its path
        const path = window.location.pathname;
        return path.replace(/[^a-zA-Z0-9]/g, '_');
    }

    async checkAnswers() {
        let totalCorrect = 0;
        let totalQuestions = 0;

        // Check each task
        for (const task of this.tasks.values()) {
            const result = await task.check();
            if (result.total) {
                totalCorrect += result.correct;
                totalQuestions += result.total;
            }
        }

        // Update progress
        const progress = Math.round((totalCorrect / totalQuestions) * 100);
        this.updateProgress(progress);

        // Save progress
        const worksheetId = this.getWorksheetId();
        this.progressManager.saveProgress(worksheetId, {
            totalCorrect,
            totalQuestions,
            progress
        });

        // Show feedback
        this.showFeedback(progress === 100);
    }

    updateProgress(progress) {
        if (this.progressBar) {
            this.progressBar.style.width = `${progress}%`;
        }
        if (this.progressText) {
            this.progressText.textContent = `${progress}% Complete`;
        }
    }

    showFeedback(isComplete) {
        const message = isComplete ? 'All answers are correct!' : 'Some answers are incorrect. Try again!';
        alert(message);
    }

    reset() {
        for (const task of this.tasks.values()) {
            task.reset();
        }
        this.updateProgress(0);
        this.saveProgress(0);
    }

    loadProgress() {
        // Load progress from local storage or other storage mechanism
    }

    saveProgress(progress) {
        // Save progress to local storage or other storage mechanism
    }

    loadSavedProgress() {
        const worksheetId = this.getWorksheetId();
        const savedProgress = this.progressManager.getProgress(worksheetId);
        
        if (savedProgress) {
            // Update progress bar
            this.updateProgress(savedProgress.progress.progress);

            // Show last attempt info
            const lastAttempt = new Date(savedProgress.timestamp);
            const attempts = savedProgress.attempts;
            
            // Optionally show a message about previous attempts
            this.showNotification(
                `Last attempt: ${lastAttempt.toLocaleDateString()} (Attempt #${attempts})`,
                'info'
            );
        }
    }

    showNotification(message, type = 'info') {
        // Create or get notification element
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }

        // Set message and type
        notification.textContent = message;
        notification.className = `notification ${type}`;

        // Show notification
        notification.style.display = 'block';

        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// Initialize the worksheet manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WorksheetManager();
});