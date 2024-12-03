import { ProgressManager } from './progressManager.js';

export class WorksheetManager {
    constructor() {
        this.tasks = new Map();
        this.progressManager = new ProgressManager();
        this.init();
    }

    async init() {
        this.progressBar = document.querySelector('.progress-bar');
        this.progressText = document.querySelector('.progress-text');

        const taskElements = document.querySelectorAll('.task-container');
        for (const element of taskElements) {
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

        document.getElementById('check')?.addEventListener('click', () => this.checkAnswers());
        document.getElementById('retry')?.addEventListener('click', () => this.reset());

        const userId = this.getUserId();
        if (userId) {
            this.progressManager.setUser(userId);
            this.loadSavedProgress();
        } else {
            this.promptForUserId();
        }
    }

    getUserId() {
        const userId = localStorage.getItem('userId');
        if (userId) return userId;

        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const devId = 'dev_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', devId);
            return devId;
        }

        return null;
    }

    promptForUserId() {
        const userId = prompt('Please enter your student ID or email:');
        if (userId) {
            localStorage.setItem('userId', userId);
            this.progressManager.setUser(userId);
        }
    }

    getWorksheetId() {
        const path = window.location.pathname;
        return path.replace(/[^a-zA-Z0-9]/g, '_');
    }

    async checkAnswers() {
        let totalCorrect = 0;
        let totalQuestions = 0;

        for (const task of this.tasks.values()) {
            const result = await task.check();
            if (result.total) {
                totalCorrect += result.correct;
                totalQuestions += result.total;
            }
        }

        const progress = Math.round((totalCorrect / totalQuestions) * 100);
        this.updateProgress(progress);

        const worksheetId = this.getWorksheetId();
        this.progressManager.saveProgress(worksheetId, {
            totalCorrect,
            totalQuestions,
            progress
        });

        this.showFeedback(progress === 100, totalCorrect, totalQuestions);
    }

    updateProgress(progress) {
        if (this.progressBar) {
            this.progressBar.style.width = `${progress}%`;
            this.progressBar.style.backgroundColor = progress === 100 ? '#28a745' : '#007bff';
        }
        if (this.progressText) {
            this.progressText.textContent = `${progress}% Complete`;
        }
    }

    showFeedback(isComplete, totalCorrect, totalQuestions) {
        const modalHtml = `
            <div class="results-modal">
                <h2>Results</h2>
                <div class="score">
                    <div class="score-number">${totalCorrect}/${totalQuestions}</div>
                    <div class="score-percentage">${Math.round((totalCorrect / totalQuestions) * 100)}%</div>
                </div>
                <div class="message">
                    ${isComplete ? 
                        'Great job! All answers are correct!' : 
                        'Keep trying! Some answers need improvement.'}
                </div>
                <button class="close-modal">Close</button>
            </div>
        `;

        let modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }

        modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = modalHtml;
        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    reset() {
        for (const task of this.tasks.values()) {
            task.reset();
        }
        this.updateProgress(0);
    }

    loadProgress() {
        const progress = localStorage.getItem('worksheet_progress');
        return progress ? JSON.parse(progress) : null;
    }

    saveProgress(progress) {
        localStorage.setItem('worksheet_progress', JSON.stringify(progress));
    }

    loadSavedProgress() {
        const worksheetId = this.getWorksheetId();
        const savedProgress = this.progressManager.getProgress(worksheetId);
        
        if (savedProgress) {
            this.updateProgress(savedProgress.progress.progress);

            const lastAttempt = new Date(savedProgress.timestamp);
            const attempts = savedProgress.attempts;
            
            this.showNotification(
                `Last attempt: ${lastAttempt.toLocaleDateString()} (Attempt #${attempts})`,
                'info'
            );
        }
    }

    showNotification(message, type = 'info') {
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WorksheetManager();
});