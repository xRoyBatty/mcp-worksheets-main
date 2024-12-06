class ComprehensionScoreDisplay {
    constructor(container) {
        this.container = container;
    }

    displayScore(score) {
        // Clear previous content
        this.container.innerHTML = '';

        // Create score summary
        const summary = document.createElement('div');
        summary.className = 'score-summary';
        summary.innerHTML = `
            <h3>Results</h3>
            <p class="score-text">Score: ${score.correct}/${score.total} (${Math.round(score.percentage)}%)</p>
        `;

        // Create detailed feedback
        const details = document.createElement('div');
        details.className = 'score-details';

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
        feedback.className = 'feedback-message';
        
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
        this.container.appendChild(summary);
        this.container.appendChild(details);
        this.container.appendChild(feedback);

        // Scroll to score if not visible
        if (!this.isElementInViewport(this.container)) {
            this.container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    clear() {
        if (this.container) {
            this.container.innerHTML = '';
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