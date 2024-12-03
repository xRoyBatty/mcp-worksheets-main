export class FillBlanksScoreDisplay {
    constructor() {
        this.container = null;
    }

    createScoreContainer() {
        const container = document.createElement('div');
        container.className = 'fillblanks-score-container';
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
        scoreHeader.className = 'fillblanks-score-header';
        scoreHeader.innerHTML = `
            <h3>Fill in the Blanks Score</h3>
            <div class="fillblanks-score-points">
                ${score.points}/${score.maxPoints} points
                (${Math.round((score.points / score.maxPoints) * 100)}%)
            </div>
            <div class="fillblanks-score-feedback">${score.feedback}</div>
        `;
        this.container.appendChild(scoreHeader);

        // Add detailed feedback
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'fillblanks-score-details';
        score.details.forEach(detail => {
            const detailElement = document.createElement('div');
            detailElement.className = `fillblanks-score-detail ${detail.correct ? 'correct' : detail.isClose ? 'close' : 'incorrect'}`;
            detailElement.innerHTML = `
                <div class="blank-info">
                    <span class="blank-number">Blank ${detail.blankIndex}</span>
                </div>
                <div class="answer-info">
                    <div class="user-answer">
                        <span class="answer-label">Your answer:</span>
                        <span class="answer-text">${detail.userAnswer}</span>
                    </div>
                    ${!detail.correct ? `
                        <div class="correct-answer">
                            <span class="answer-label">Correct answer:</span>
                            <span class="answer-text">${detail.correctAnswer}</span>
                        </div>
                    ` : ''}
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