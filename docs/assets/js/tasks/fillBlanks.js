import BaseTask from './baseTask.js';
import { FillBlanksScoring } from '../scoring/fillBlanks/scoring.js';
import { FillBlanksScoreDisplay } from '../scoring/fillBlanks/display.js';

export default class FillBlanks extends BaseTask {
    constructor(element) {
        super(element);
        this.inputs = element.querySelectorAll('input[type="text"]');
        this.scoring = new FillBlanksScoring();
        this.scoreDisplay = new FillBlanksScoreDisplay();
        this.setupInputHandling();
    }

    setupInputHandling() {
        this.inputs.forEach(input => {
            // Clean value on focus
            input.addEventListener('focus', () => {
                this.setState(input, '');
            });

            // Handle Enter key to move to next input
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const nextInput = Array.from(this.inputs)
                        .find(inp => !inp.value && inp !== input);
                    if (nextInput) nextInput.focus();
                }
            });
        });
    }

    async check() {
        // Use scoring system to evaluate answers
        const score = this.scoring.calculateScore(this.inputs);

        // Apply visual feedback
        this.inputs.forEach((input, index) => {
            const evaluation = score.details[index];
            this.setState(input, evaluation.correct ? 'correct' : 'incorrect');

            // Show tooltip with correct answer for incorrect responses
            if (!evaluation.correct) {
                input.title = `Correct answer: ${evaluation.correctAnswer}`;
            }
        });

        // Display detailed scoring
        this.scoreDisplay.displayScore(score, this.element);

        return { correct: score.points, total: score.maxPoints };
    }

    reset() {
        this.inputs.forEach(input => {
            input.value = '';
            input.title = '';
            this.setState(input, '');
        });
        this.scoreDisplay.clear();
    }
}