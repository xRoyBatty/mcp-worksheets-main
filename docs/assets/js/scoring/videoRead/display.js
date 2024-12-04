class VideoReadScoreDisplay {
  constructor(container) {
    this.container = container;
  }

  displayScore(score) {
    const { correct, total, answers } = score;
    const percentage = ((correct / total) * 100).toFixed(1);

    const scoreHtml = `
      <div class="video-read-score">
        <div class="video-read-score-header">Results</div>
        <div class="video-read-score-details">
          <span class="video-read-score-label">Correct answers:</span>
          <span class="video-read-score-value">${correct}/${total} (${percentage}%)</span>
        </div>
        <div class="true-false-feedbacks">
          ${this._generateFeedback(answers)}
        </div>
      </div>
    `;

    this.container.innerHTML = scoreHtml;
  }

  _generateFeedback(answers) {
    return answers.map((answer, index) => {
      const isCorrect = answer.selected === answer.correct;
      const status = isCorrect ? 'correct' : 'incorrect';
      return `
        <div class="true-false-feedback ${status}">
          <span>Question ${index + 1}:</span>
          <span>${isCorrect ? '✓' : '✗'}</span>
          ${!isCorrect ? `<span>(Correct answer: ${answer.correct})</span>` : ''}
        </div>
      `;
    }).join('');
  }

  clear() {
    this.container.innerHTML = '';
  }
}