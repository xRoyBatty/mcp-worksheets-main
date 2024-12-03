export class FillBlanksScoring {
    constructor() {
        this.score = {
            points: 0,
            maxPoints: 0,
            details: [],
            feedback: ''
        };
    }

    evaluateAnswer(inputElement) {
        const userAnswer = inputElement.value.trim().toLowerCase();
        const correctAnswer = inputElement.dataset.correct.toLowerCase();
        const isCorrect = userAnswer === correctAnswer;
        
        // Calculate similarity for partial feedback
        const similarity = this.calculateSimilarity(userAnswer, correctAnswer);
        const isClose = similarity > 0.8; // 80% similar

        return {
            correct: isCorrect,
            points: isCorrect ? 1 : 0,
            userAnswer: userAnswer || 'No answer',
            correctAnswer,
            isClose,
            feedback: this.getFeedback(isCorrect, isClose)
        };
    }

    calculateSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));

        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                if (str1[i-1] === str2[j-1]) {
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i-1][j-1] + 1,
                        matrix[i][j-1] + 1,
                        matrix[i-1][j] + 1
                    );
                }
            }
        }

        const maxLen = Math.max(len1, len2);
        return (maxLen - matrix[len1][len2]) / maxLen;
    }

    getFeedback(isCorrect, isClose) {
        if (isCorrect) return 'Correct!';
        if (isClose) return 'Very close! Check your spelling.';
        return 'Incorrect. Try again.';
    }

    calculateScore(inputs) {
        this.score.maxPoints = inputs.length;
        this.score.points = 0;
        this.score.details = [];

        inputs.forEach((input, index) => {
            const evaluation = this.evaluateAnswer(input);
            if (evaluation.correct) this.score.points++;

            this.score.details.push({
                blankIndex: index + 1,
                ...evaluation
            });
        });

        this.score.feedback = this.generateOverallFeedback();
        return this.score;
    }

    generateOverallFeedback() {
        const percentage = (this.score.points / this.score.maxPoints) * 100;
        if (percentage === 100) {
            return 'Perfect! All blanks filled correctly!';
        } else if (percentage >= 75) {
            return 'Great job! Most answers are correct.';
        } else if (percentage >= 50) {
            return 'Keep going! About half way there.';
        } else {
            return 'Keep practicing! Review the answers carefully.';
        }
    }
}