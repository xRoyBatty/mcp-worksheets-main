export class DictationScoring {
    constructor() {
        this.score = {
            points: 0,
            maxPoints: 0,
            details: [],
            wordScores: [],
            feedback: ''
        };
    }

    evaluateDictation(textarea) {
        const userText = textarea.value.trim().toLowerCase();
        const correctText = textarea.dataset.text.trim().toLowerCase();
        
        const userWords = userText.split(/\s+/);
        const correctWords = correctText.split(/\s+/);
        
        this.score.maxPoints = correctWords.length;
        this.score.points = 0;
        this.score.wordScores = [];
        
        // Evaluate each word
        const evaluatedWords = correctWords.map((correctWord, index) => {
            const userWord = userWords[index] || '';
            const evaluation = this.evaluateWord(userWord, correctWord);
            
            if (evaluation.correct) this.score.points++;
            this.score.wordScores.push(evaluation);
            
            return evaluation;
        });

        // Extra words typed by user (if any)
        if (userWords.length > correctWords.length) {
            for (let i = correctWords.length; i < userWords.length; i++) {
                this.score.wordScores.push({
                    userWord: userWords[i],
                    correctWord: '',
                    correct: false,
                    similarity: 0,
                    status: 'extra'
                });
            }
        }

        this.score.details = this.generateDetails(correctText, userText);
        this.score.feedback = this.generateFeedback();
        return this.score;
    }

    evaluateWord(userWord, correctWord) {
        const similarity = this.calculateSimilarity(userWord, correctWord);
        const isCorrect = similarity === 1;
        const isClose = similarity >= 0.8; // 80% similar

        return {
            userWord,
            correctWord,
            correct: isCorrect,
            similarity,
            status: isCorrect ? 'correct' : isClose ? 'close' : 'incorrect'
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

    generateDetails(correctText, userText) {
        return [{
            text: correctText,
            userText: userText,
            correctWordCount: this.score.points,
            totalWords: this.score.maxPoints,
            accuracy: (this.score.points / this.score.maxPoints * 100).toFixed(1)
        }];
    }

    generateFeedback() {
        const percentage = (this.score.points / this.score.maxPoints) * 100;
        
        if (percentage === 100) {
            return 'Perfect! Every word is correct!';
        } else if (percentage >= 90) {
            return 'Excellent! Just a few small mistakes.';
        } else if (percentage >= 75) {
            return 'Good job! Most words are correct.';
        } else if (percentage >= 50) {
            return 'Keep practicing! You got about half the words right.';
        } else {
            return 'Listen carefully and try again. Focus on one word at a time.';
        }
    }
}