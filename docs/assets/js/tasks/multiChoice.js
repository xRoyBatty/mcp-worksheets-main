import BaseTask from './baseTask.js';
import { MultiChoiceScoring } from '../scoring/multiChoice/scoring.js';
import { MultiChoiceScoreDisplay } from '../scoring/multiChoice/display.js';

export default class MultipleChoice extends BaseTask {
    constructor(element) {
        super(element);
        this.questions = element.querySelectorAll('.question');
        this.scoring = new MultiChoiceScoring();
        this.scoreDisplay = new MultiChoiceScoreDisplay();
    }

    async check() {
        // Use scoring system to evaluate answers
        const score = this.scoring.calculateScore(this.questions);

        // Apply visual feedback
        this.questions.forEach((question, index) => {
            const selected = question.querySelector('input:checked');
            if (selected) {
                const isCorrect = selected.dataset.correct === 'true';
                this.setState(selected.parentElement, isCorrect ? 'correct' : 'incorrect');
            }
        });

        // Display detailed scoring
        this.scoreDisplay.displayScore(score, this.element);

        return { correct: score.points, total: score.maxPoints };
    }

    reset() {
        this.questions.forEach(question => {
            const options = question.querySelectorAll('.option');
            options.forEach(option => {
                option.classList.remove('correct', 'incorrect');
                option.querySelector('input').checked = false;
            });
        });
        this.scoreDisplay.clear();
    }
}