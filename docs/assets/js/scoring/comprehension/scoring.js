export class ComprehensionScoring {
    constructor() {
        this.userAnswers = new Map();
        this.correctAnswers = new Map();
    }

    submitAnswer(index, answer) {
        this.userAnswers.set(index, answer);
    }

    setCorrectAnswer(index, answer) {
        this.correctAnswers.set(index, answer);
    }

    getCorrectAnswer(index) {
        return this.correctAnswers.get(index);
    }

    calculateScore() {
        let correct = 0;
        const answers = [];
        const total = this.correctAnswers.size;

        for (let [index, correctAnswer] of this.correctAnswers) {
            const userAnswer = this.userAnswers.get(index);
            const isCorrect = userAnswer === correctAnswer;
            if (isCorrect) correct++;

            answers.push({
                index,
                selected: userAnswer,
                correct: correctAnswer,
                isCorrect
            });
        }

        return {
            correct,
            total,
            answers,
            percentage: total ? (correct / total) * 100 : 0
        };
    }

    reset() {
        this.userAnswers.clear();
    }
}