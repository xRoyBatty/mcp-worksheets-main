export class ComprehensionScoreDisplay {
    constructor() {
        this.container = null;
    }

    createScoreContainer() {
        const container = document.createElement('div');
        container.className = 'comprehension-score-container';
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
        scoreHeader.className = 'comprehension-score-header';
        scoreHeader.innerHTML = `
            <h3>Reading Comprehension Score</h3>
            <div class="comprehension-score-points">
                ${score.correct}/${score.total} correct
                (${Math.round(score.percentage)}%)
            </div>
        `;

        // Add detailed feedback
        const details = document.createElement('div');
        details.className = 'comprehension-score-details';

        score.answers.forEach((answer, index) => {
            const item = document.createElement('div');
            item.className = `answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`;
            item.innerHTML = `
                <span class="answer-number">#${index + 1}</span>
                <span class="answer-icon">${answer.isCorrect ? '✓' : '✗'}</span>
                <span class="answer-text">
                    You answered: ${answer.selected ? 'True' : 'False'}
                    ${!answer.isCorrect ? ` (Correct answer: ${answer.correct ? 'True' : 'False'})` : ''}
                </span>
            `;
            details.appendChild(item);
        });

        // Add feedback message
        const feedback = document.createElement('p');
        feedback.className = 'comprehension-score-feedback';
        
        if (score.percentage === 100) {
            feedback.textContent = 'Excellent! Perfect score!';
            feedback.className += ' perfect';
        } else if (score.percentage >= 80) {
            feedback.textContent = 'Great job! Keep it up!';
            feedback.className += ' great';
        } else if (score.percentage >= 60) {
            feedback.textContent = 'Good effort! Review the incorrect answers.';
            feedback.className += ' good';
        } else {
            feedback.textContent = 'Keep practicing! Try reading the text again carefully.';
            feedback.className += ' needs-practice';
        }

        // Append all elements
        this.container.appendChild(scoreHeader);
        this.container.appendChild(details);
        this.container.appendChild(feedback);

        // Insert after the task element
        taskElement.parentNode.insertBefore(this.container, taskElement.nextSibling);

        // Scroll to score if not visible
        if (!this.isElementInViewport(this.container)) {
            this.container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    clear() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }

    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}