/**
 * Build quiz state from parsed data.
 * Returns: { questions: [{question, options}], answers: string[] }
 * correct_answer is NEVER placed inside the questions array.
 */

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildQuiz(config, data) {
  if (config.type === "week") {
    const weekData = data.weeks.find((w) => w.week === config.weekNumber);
    if (!weekData) throw new Error(`Week ${config.weekNumber} not found in data.`);

    const questions = weekData.questions.map((q) => ({
      question: q.question,
      options: [...q.options],
    }));
    const answers = weekData.questions.map((q) => q.correct_answer);

    validate(questions, answers);
    return { questions, answers };
  }

  if (config.type === "all") {
    const allRaw = data.weeks.flatMap((w) => w.questions);
    const shuffledRaw = shuffleArray(allRaw);

    const questions = shuffledRaw.map((q) => {
      const shuffledOptions = shuffleArray([...q.options]);
      return { question: q.question, options: shuffledOptions };
    });
    const answers = shuffledRaw.map((q) => q.correct_answer);

    validate(questions, answers);
    return { questions, answers };
  }

  throw new Error("Invalid quiz config type.");
}

function validate(questions, answers) {
  for (let i = 0; i < questions.length; i++) {
    if (!questions[i].options.includes(answers[i])) {
      throw new Error(
        `Answer validation failed at Q${i + 1}: "${answers[i]}" not found in options.`
      );
    }
  }
}
