import BaseTask from './baseTask.js';
import { DictationScoring } from '../scoring/dictation/scoring.js';
import { DictationScoreDisplay } from '../scoring/dictation/display.js';

export default class Dictation extends BaseTask {
    constructor(element) {
        super(element);
        this.textarea = element.querySelector('textarea');
        this.text = this.textarea?.dataset.text || '';
        this.maxAttempts = parseInt(this.textarea?.dataset.maxAttempts || '3', 10);
        this.attempts = this.maxAttempts;
        this.currentSpeed = 1;
        this.scoring = new DictationScoring();
        this.scoreDisplay = new DictationScoreDisplay();

        // Setup play button
        this.playBtn = element.querySelector('.play-btn');
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.play());
        }

        // Setup speed buttons
        element.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                element.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSpeed = parseFloat(btn.dataset.speed);
            });
        });

        // Update attempts display
        this.updateAttempts();
    }

    updateAttempts() {
        const attemptsDisplay = this.element.querySelector('.attempts');
        if (attemptsDisplay) {
            attemptsDisplay.textContent = `Plays left: ${this.attempts}`;
        }

        if (this.playBtn) {
            if (this.attempts > 0) {
                this.playBtn.removeAttribute('disabled');
            } else {
                this.playBtn.setAttribute('disabled', 'true');
            }
        }
    }

    play() {
        if (this.attempts <= 0 || !this.text) return;

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(this.text);
        
        // Set voice from global selector
        const selector = document.getElementById('globalVoice');
        if (selector && selector.value) {
            const voice = speechSynthesis.getVoices()
                .find(v => v.name === selector.value);
            if (voice) utterance.voice = voice;
        }

        // Set speed
        utterance.rate = this.currentSpeed;

        // Play audio
        speechSynthesis.speak(utterance);

        // Update attempts
        this.attempts--;
        this.updateAttempts();
    }

    async check() {
        if (!this.textarea || !this.text) return { correct: 0, total: 1 };

        // Use scoring system to evaluate the dictation
        const score = this.scoring.evaluateDictation(this.textarea);

        // Apply visual feedback based on overall performance
        const overallAccuracy = score.points / score.maxPoints;
        if (overallAccuracy >= 0.8) {
            this.setState(this.textarea, 'correct');
        } else if (overallAccuracy >= 0.5) {
            this.setState(this.textarea, 'partial');
        } else {
            this.setState(this.textarea, 'incorrect');
        }

        // Display detailed scoring
        this.scoreDisplay.displayScore(score, this.element);

        return {
            correct: score.points,
            total: score.maxPoints
        };
    }

    reset() {
        if (this.textarea) {
            this.textarea.value = '';
            this.textarea.title = '';
            this.setState(this.textarea, '');
        }
        this.attempts = this.maxAttempts;
        this.updateAttempts();
        this.scoreDisplay.clear();
    }
}