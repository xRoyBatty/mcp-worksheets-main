export class MultiChoiceScoring {
    constructor() {
        this.score = {
            points: 0,
            maxPoints: 0,
            details: [],
            feedback: ''
        };
    }

    evaluateAnswer(question, selected) {
        const isCorrect = selected && selected.dataset.correct === 'true';
        const questionText = question.querySelector('p').textContent;
        const selectedText = selected ? selected.nextElementSibling.textContent : 'No answer';

        return {
            correct: isCorrect,
            points: isCorrect ? 1 : 0,
            question: questionText,
            answer: selectedText,
            feedback: isCorrect ? 'Correct answer!' : 'Incorrect answer'
        };
    }

    calculateScore(questions) {
        this.score.maxPoints = questions.length;
        this.score.points = 0;
        this.score.details = [];

        questions.forEach((question, index) => {
            const selected = question.querySelector('input:checked');
            const evaluation = this.evaluateAnswer(question, selected);
            
            this.score.points += evaluation.points;
            this.score.details.push({
                questionIndex: index + 1,
                ...evaluation
            });
        });

        this.score.feedback = this.generateFeedback();
        return this.score;
    }

    generateFeedback() {
        const percentage = (this.score.points / this.score.maxPoints) * 100;
        if (percentage === 100) {
            return 'Perfect! All answers are correct!';
        } else if (percentage >= 75) {
            return 'Good job! Most answers are correct.';
        } else if (percentage >= 50) {
            return 'Keep practicing! About half of the answers are correct.';
        } else {
            return 'Try again! Review your answers carefully.';
        }
    }
}