class ComprehensionTask extends BaseTask {
  constructor(container, data) {
    super(container, data);
    this.statements = data.statements;
    this.contentType = data.contentType; // 'video', 'text', or 'audio'
    this.content = data.content; // Depends on contentType
    
    this.scoring = new ComprehensionScoring(this.statements);
    this.scoreDisplay = new ComprehensionScoreDisplay(this.container.querySelector('.score-container'));
    
    this.initializeContent();
    this.initializeEventListeners();
  }

  initializeContent() {
    switch(this.contentType) {
      case 'text':
        this.initializeTextToSpeech();
        break;
      case 'audio':
        this.initializeAudioPlayer();
        break;
      // video content is handled by YouTube iframe
    }
  }

  initializeTextToSpeech() {
    const ttsBtn = this.container.querySelector('.text-to-speech-btn');
    const textContent = this.container.querySelector('.reading-text').textContent;
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

  initializeAudioPlayer() {
    const audioContent = this.container.querySelector('.audio-content');
    const playBtn = audioContent.querySelector('.play-btn');
    const pauseBtn = audioContent.querySelector('.pause-btn');
    const stopBtn = audioContent.querySelector('.stop-btn');
    const progress = audioContent.querySelector('progress');
    const timeDisplay = audioContent.querySelector('.time-display');

    // Create audio element from base64 data
    const audio = new Audio(`data:audio/mp3;base64,${this.content}`);

    playBtn.addEventListener('click', () => {
      audio.play();
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'block';
    });

    pauseBtn.addEventListener('click', () => {
      audio.pause();
      pauseBtn.style.display = 'none';
      playBtn.style.display = 'block';
    });

    stopBtn.addEventListener('click', () => {
      audio.pause();
      audio.currentTime = 0;
      pauseBtn.style.display = 'none';
      playBtn.style.display = 'block';
    });

    audio.addEventListener('timeupdate', () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      progress.value = percent;
      
      const currentMin = Math.floor(audio.currentTime / 60);
      const currentSec = Math.floor(audio.currentTime % 60);
      const totalMin = Math.floor(audio.duration / 60);
      const totalSec = Math.floor(audio.duration % 60);
      
      timeDisplay.textContent = `${String(currentMin).padStart(2, '0')}:${String(currentSec).padStart(2, '0')} / ${String(totalMin).padStart(2, '0')}:${String(totalSec).padStart(2, '0')}`;
    });

    audio.addEventListener('ended', () => {
      pauseBtn.style.display = 'none';
      playBtn.style.display = 'block';
    });
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
      type: 'comprehension',
      score: score.percentage,
      details: {
        contentType: this.contentType,
        correct: score.correct,
        total: score.total,
        answers: score.answers
      }
    });
  }
}