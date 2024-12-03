export class WorksheetManager {
    constructor() {
        this.tasks = new Map();
        this.init();
    }

    async init() {
        // Find progress elements
        this.progressBar = document.querySelector('.progress-bar');
        this.progressText = document.querySelector('.progress-text');

        // Load tasks
        const taskElements = document.querySelectorAll('.task-container');
        for (const element of taskElements) {
            const taskType = element.classList[1];  // e.g., multiple-choice, fill-blanks, etc.
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

        // Load saved progress
        this.loadProgress();
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
        this.saveProgress(progress);

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
}

document.addEventListener('DOMContentLoaded', () => {
    new WorksheetManager();
});