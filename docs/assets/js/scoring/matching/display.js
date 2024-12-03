export class MatchingScoreDisplay {
    constructor() {
        this.container = null;
    }

    createScoreContainer() {
        const container = document.createElement('div');
        container.className = 'matching-score-container';
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
        scoreHeader.className = 'matching-score-header';
        scoreHeader.innerHTML = `
            <h3>Matching Exercise Score</h3>
            <div class="matching-score-points">
                ${score.points}/${score.maxPoints} points
                (${Math.round((score.points / score.maxPoints) * 100)}%)
            </div>
            <div class="matching-score-feedback">${score.feedback}</div>
        `;
        this.container.appendChild(scoreHeader);

        // Add detailed feedback
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'matching-score-details';
        score.details.forEach(detail => {
            const detailElement = document.createElement('div');
            detailElement.className = `matching-score-detail ${detail.correct ? 'correct' : 'incorrect'}`;
            detailElement.innerHTML = `
                <span class="connection">${detail.from} ↔ ${detail.to}</span>
                <span class="feedback">${detail.feedback}</span>
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