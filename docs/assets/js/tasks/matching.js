import BaseTask from './baseTask.js';
import { MatchingScoring } from '../scoring/matching/scoring.js';
import { MatchingScoreDisplay } from '../scoring/matching/display.js';

export default class Matching extends BaseTask {
    constructor(element) {
        super(element);
        this.pairs = element.querySelector('.pairs');
        this.items = element.querySelectorAll('.item');
        this.selected = null;
        this.connections = [];
        this.setupSVG();
        this.setupEvents();
        this.scoring = new MatchingScoring();
        this.scoreDisplay = new MatchingScoreDisplay();
    }

    setupSVG() {
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.style.position = 'absolute';
        this.svg.style.top = '0';
        this.svg.style.left = '0';
        this.svg.style.width = '100%';
        this.svg.style.height = '100%';
        this.svg.style.pointerEvents = 'none';
        this.pairs.style.position = 'relative';
        this.pairs.insertBefore(this.svg, this.pairs.firstChild);
        
        window.addEventListener('resize', () => this.updateLines());
    }

    setupEvents() {
        this.items.forEach(item => {
            item.addEventListener('click', () => this.handleClick(item));
            
            item.setAttribute('tabindex', '0');
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleClick(item);
                }
            });
        });
    }

    handleClick(item) {
        if (!this.selected) {
            // First item selected
            this.selected = item;
            item.classList.add('selected');
        } else if (this.selected === item) {
            // Deselect if same item
            this.selected.classList.remove('selected');
            this.selected = null;
        } else {
            // Make a connection without immediate validation
            this.connections.push({
                from: this.selected,
                to: item,
                pairId1: this.selected.dataset.pair,
                pairId2: item.dataset.pair
            });
            this.selected.classList.remove('selected');
            this.drawLines('#666');
            this.selected = null;
        }
    }

    drawLines(color = '#666') {
        this.svg.innerHTML = '';
        
        this.connections.forEach(conn => {
            const rect1 = conn.from.getBoundingClientRect();
            const rect2 = conn.to.getBoundingClientRect();
            const pairsRect = this.pairs.getBoundingClientRect();

            const x1 = rect1.right - pairsRect.left;
            const y1 = rect1.top + rect1.height/2 - pairsRect.top;
            const x2 = rect2.left - pairsRect.left;
            const y2 = rect2.top + rect2.height/2 - pairsRect.top;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', conn.correct ? '#28a745' : color);
            line.setAttribute('stroke-width', '2');
            this.svg.appendChild(line);
        });
    }

    updateLines() {
        const rect = this.pairs.getBoundingClientRect();
        this.svg.setAttribute('width', rect.width);
        this.svg.setAttribute('height', rect.height);
        this.drawLines();
    }

    async check() {
        const totalPairs = Array.from(this.items).filter(item => 
            item.closest('.left') !== null
        ).length;

        // Use scoring system to evaluate connections
        const score = this.scoring.calculateScore(this.connections, totalPairs);

        // Update visual feedback
        this.connections.forEach(conn => {
            const evaluation = this.scoring.evaluateConnection(conn);
            conn.correct = evaluation.correct;
            
            // Apply visual feedback
            if (evaluation.correct) {
                conn.from.classList.add('correct');
                conn.to.classList.add('correct');
            } else {
                conn.from.classList.add('incorrect');
                conn.to.classList.add('incorrect');
            }
        });

        // Update line colors
        this.drawLines();

        // Display detailed scoring
        this.scoreDisplay.displayScore(score, this.element);

        return { correct: score.points, total: score.maxPoints };
    }

    reset() {
        this.connections = [];
        this.selected = null;
        this.items.forEach(item => {
            item.classList.remove('selected', 'correct', 'incorrect');
        });
        this.svg.innerHTML = '';
        this.scoreDisplay.clear();
    }
}