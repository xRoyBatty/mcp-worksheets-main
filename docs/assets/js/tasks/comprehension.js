import BaseTask from './baseTask.js';
import { ComprehensionScoring } from '../scoring/comprehension/scoring.js';
import { ComprehensionScoreDisplay } from '../scoring/comprehension/display.js';

export default class Comprehension extends BaseTask {
    constructor(element) {
        super(element);
        this.statements = element.querySelectorAll('.true-false-item');
        this.scoring = new ComprehensionScoring();
        this.scoreDisplay = new ComprehensionScoreDisplay(element.querySelector('.score-container'));
        
        this.initializeContent();
        this.initializeEventListeners();
    }

    initializeContent() {
        // Initialize text-to-speech if available
        const ttsBtn = this.element.querySelector('.text-to-speech-btn');
        const textContent = this.element.querySelector('.reading-text')?.textContent;
        
        if (ttsBtn && textContent) {
            let isPlaying = false;
            let utterance = null;

            ttsBtn.addEventListener('click', () => {
                if (isPlaying) {
                    window.speechSynthesis.cancel();
                    isPlaying = false;
                    ttsBtn.setAttribute('aria-pressed', 'false');
                } else {
                    utterance = new SpeechSynthesisUtterance(textContent);
                    utterance.onend = () => {
                        isPlaying = false;
                        ttsBtn.setAttribute('aria-pressed', 'false');
                    };
                    window.speechSynthesis.speak(utterance);
                    isPlaying = true;
                    ttsBtn.setAttribute('aria-pressed', 'true');
                }
            });
        }
    }

    initializeEventListeners() {
        // Handle radio button changes
        this.element.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const item = e.target.closest('.true-false-item');
                const index = parseInt(item.dataset.statementIndex);
                const isTrue = e.target.value === 'true';
                this.scoring.submitAnswer(index, isTrue);
            });
        });
    }

    async check() {
        // Get total statements count
        const total = this.statements.length;
        if (total === 0) return { correct: 0, total: 0 };

        // Calculate score
        let correct = 0;
        this.statements.forEach((item, index) => {
            const selectedInput = item.querySelector('input[type="radio"]:checked');
            if (selectedInput) {
                const userAnswer = selectedInput.value === 'true';
                const correctAnswer = this.scoring.getCorrectAnswer(index);
                const isCorrect = userAnswer === correctAnswer;

                // Apply visual feedback
                this.setState(item, isCorrect ? 'correct' : 'incorrect');
                if (isCorrect) correct++;
            }
        });

        // Display score
        const score = {
            correct,
            total,
            percentage: (correct / total) * 100
        };
        this.scoreDisplay.displayScore(score);

        // Disable inputs
        this.element.querySelectorAll('input[type="radio"]')
            .forEach(input => input.disabled = true);

        return { correct, total };
    }

    reset() {
        // Clear all selections and states
        this.statements.forEach(item => {
            this.setState(item, '');
            item.querySelectorAll('input[type="radio"]').forEach(input => {
                input.checked = false;
                input.disabled = false;
            });
        });

        // Clear score display
        this.scoreDisplay.clear();

        // Reset scoring
        this.scoring.reset();
    }
}