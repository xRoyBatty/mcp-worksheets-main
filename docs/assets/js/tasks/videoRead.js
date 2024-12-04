class VideoReadTask extends BaseTask {
  constructor(container, data) {
    super(container, data);
    this.statements = data.statements;
    this.videoId = data.videoId;
    
    this.scoring = new VideoReadScoring(this.statements);
    this.scoreDisplay = new VideoReadScoreDisplay(this.container.querySelector('.score-container'));
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Handle radio button changes
    this.container.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const item = e.target.closest('.true-false-item');
        const index = parseInt(item.dataset.statementIndex);
        this.scoring.submitAnswer(index, e.target.value === 'true');
        this.updateSubmitButton();
      });
    });

    // Handle submit button
    this.submitBtn = this.container.querySelector('.submit-btn');
    this.submitBtn.addEventListener('click', () => this.submitTask());

    // Handle reset button
    this.resetBtn = this.container.querySelector('.reset-btn');
    this.resetBtn.addEventListener('click', () => this.resetTask());
  }

  updateSubmitButton() {
    const allAnswered = this.statements.every((_, index) => 
      this.container.querySelector(`input[name="statement_${index}"]:checked`)
    );
    this.submitBtn.disabled = !allAnswered;
  }

  async submitTask() {
    const score = this.scoring.calculateScore();
    this.scoreDisplay.displayScore(score);
    this.disableInputs();
    await this.reportProgress(score);
  }

  resetTask() {
    this.scoring.reset();
    this.scoreDisplay.clear();
    this.enableInputs();
    this.clearInputs();
    this.updateSubmitButton();
  }

  disableInputs() {
    this.container.querySelectorAll('input[type="radio"]')
      .forEach(input => input.disabled = true);
    this.submitBtn.disabled = true;
  }

  enableInputs() {
    this.container.querySelectorAll('input[type="radio"]')
      .forEach(input => input.disabled = false);
  }

  clearInputs() {
    this.container.querySelectorAll('input[type="radio"]')
      .forEach(input => input.checked = false);
  }

  async reportProgress(score) {
    return super.reportProgress({
      taskId: this.taskId,
      type: 'videoRead',
      score: score.percentage,
      details: {
        correct: score.correct,
        total: score.total,
        answers: score.answers
      }
    });
  }
}