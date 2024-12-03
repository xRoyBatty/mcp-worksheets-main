export class DictationScoreDisplay {
    constructor() {
        this.container = null;
    }

    createScoreContainer() {
        const container = document.createElement('div');
        container.className = 'dictation-score-container';
        return container;
    }

    displayScore(score, taskElement) {
        // Remove existing score display if any
        if (this.container) {
            this.container.remove();
        }

        // Create new score container
        this.container = this.createScoreContainer();

        // Add overall score
        const scoreHeader = document.createElement('div');
        scoreHeader.className = 'dictation-score-header';
        scoreHeader.innerHTML = `
            <h3>Dictation Score</h3>
            <div class="dictation-score-points">
                ${score.points}/${score.maxPoints} words correct
                (${Math.round((score.points / score.maxPoints) * 100)}%)
            </div>
            <div class="dictation-score-feedback">${score.feedback}</div>
        `;
        this.container.appendChild(scoreHeader);

        // Add word-by-word analysis
        const wordAnalysis = document.createElement('div');
        wordAnalysis.className = 'dictation-word-analysis';
        wordAnalysis.innerHTML = `
            <h4>Word-by-Word Analysis</h4>
            <div class="word-comparison">
                ${score.wordScores.map((word, index) => `
                    <div class="word-pair ${word.status}">
                        <div class="word-number">${index + 1}</div>
                        <div class="word-content">
                            <div class="user-word">${word.userWord || '(missing)'}</div>
                            ${word.status !== 'correct' ? `
                                <div class="correct-word">${word.correctWord}</div>
                            ` : ''}
                            ${word.status === 'close' ? `
                                <div class="similarity">(${Math.round(word.similarity * 100)}% similar)</div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        this.container.appendChild(wordAnalysis);

        // Insert after the task element
        taskElement.parentNode.insertBefore(this.container, taskElement.nextSibling);
    }

    clear() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}