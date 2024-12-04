class VideoReadScoring {
  constructor(statements) {
    this.statements = statements;
    this.answers = [];
  }

  submitAnswer(index, answer) {
    this.answers[index] = answer;
  }

  calculateScore() {
    let correct = 0;
    const answers = this.statements.map((statement, index) => {
      const selected = this.answers[index];
      const isCorrect = selected === statement.correct;
      if (isCorrect) correct++;

      return {
        selected,
        correct: statement.correct,
        isCorrect
      };
    });

    return {
      correct,
      total: this.statements.length,
      answers,
      percentage: (correct / this.statements.length) * 100
    };
  }

  reset() {
    this.answers = [];
  }
}