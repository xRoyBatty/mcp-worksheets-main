export class MatchingScoring {
    constructor() {
        this.score = {
            points: 0,
            maxPoints: 0,
            details: [],
            feedback: ''
        };
    }

    evaluateConnection(connection) {
        const isCorrect = connection.pairId1 === connection.pairId2;
        return {
            correct: isCorrect,
            points: isCorrect ? 1 : 0,
            feedback: isCorrect ? 'Correct match!' : 'Incorrect match'
        };
    }

    calculateScore(connections, totalPairs) {
        this.score.maxPoints = totalPairs;
        this.score.points = 0;
        this.score.details = [];

        connections.forEach((connection, index) => {
            const evaluation = this.evaluateConnection(connection);
            this.score.points += evaluation.points;
            this.score.details.push({
                connectionIndex: index,
                from: connection.from.textContent,
                to: connection.to.textContent,
                correct: evaluation.correct,
                feedback: evaluation.feedback
            });
        });

        this.score.feedback = this.generateFeedback();
        return this.score;
    }

    generateFeedback() {
        const percentage = (this.score.points / this.score.maxPoints) * 100;
        if (percentage === 100) {
            return 'Perfect! All matches are correct!';
        } else if (percentage >= 75) {
            return 'Good job! Most matches are correct.';
        } else if (percentage >= 50) {
            return 'Keep practicing! About half of the matches are correct.';
        } else {
            return 'Try again! Review the connections carefully.';
        }
    }
}