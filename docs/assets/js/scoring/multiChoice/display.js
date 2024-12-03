export class MultiChoiceScoreDisplay {
    constructor() {
        this.container = null;
    }

    createScoreContainer() {
        const container = document.createElement('div');
        container.className = 'multichoice-score-container';
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
        scoreHeader.className = 'multichoice-score-header';
        scoreHeader.innerHTML = `
            <h3>Multiple Choice Score</h3>
            <div class="multichoice-score-points">
                ${score.points}/${score.maxPoints} points
                (${Math.round((score.points / score.maxPoints) * 100)}%)
            </div>
            <div class="multichoice-score-feedback">${score.feedback}</div>
        `;
        this.container.appendChild(scoreHeader);

        // Add detailed feedback
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'multichoice-score-details';
        score.details.forEach(detail => {
            const detailElement = document.createElement('div');
            detailElement.className = `multichoice-score-detail ${detail.correct ? 'correct' : 'incorrect'}`;
            detailElement.innerHTML = `
                <div class="question-info">
                    <span class="question-number">Question ${detail.questionIndex}</span>
                    <span class="question-text">${detail.question}</span>
                </div>
                <div class="answer-info">
                    <span class="answer-label">Your answer:</span>
                    <span class="answer-text">${detail.answer}</span>
                </div>
                <div class="feedback">${detail.feedback}</div>
            `;
            detailsContainer.appendChild(detailElement);
        });
        this.container.appendChild(detailsContainer);

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