import { create } from "zustand";

/**
 * Shuffle array using Fisher-Yates with a seed-based PRNG (mulberry32).
 */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleArray(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Shuffle question options and remap correct_answer.
 * Returns new question object with shuffled options.
 * correct_answer is stored separately and NOT exposed in returned object.
 */
function shuffleQuestionOptions(question, rand) {
  const shuffledOptions = shuffleArray(question.options, rand);

  // Validate remapping
  if (!shuffledOptions.includes(question.correct_answer)) {
    throw new Error(
      `Shuffle validation failed: correct_answer "${question.correct_answer}" lost after shuffle for question "${question.question.substring(0, 40)}..."`
    );
  }

  return {
    question: question.question,
    options: shuffledOptions,
    // correct_answer intentionally NOT included here — stored in separate answers map
  };
}

/**
 * Build the quiz state for All Weeks mode.
 * Returns: { questions (no correct_answer), answersMap { index -> correct_answer } }
 */
export function buildAllWeeksQuiz(weeksData, seed) {
  const rand = mulberry32(seed);

  // Flatten all questions
  let allQuestions = [];
  for (const week of weeksData) {
    for (const q of week.questions) {
      allQuestions.push({ ...q, weekNumber: week.week });
    }
  }

  // Shuffle question order
  const shuffledQuestions = shuffleArray(allQuestions, rand);

  const safeQuestions = [];
  const answersMap = {};

  for (let i = 0; i < shuffledQuestions.length; i++) {
    const q = shuffledQuestions[i];
    const shuffled = shuffleQuestionOptions(q, rand);
    safeQuestions.push(shuffled);
    answersMap[i] = q.correct_answer; // stored separately
  }

  return { questions: safeQuestions, answersMap };
}

/**
 * Build week-wise quiz state (no shuffle).
 * Returns: { questions (no correct_answer), answersMap }
 */
export function buildWeekQuiz(weekData) {
  const safeQuestions = [];
  const answersMap = {};

  for (let i = 0; i < weekData.questions.length; i++) {
    const q = weekData.questions[i];
    safeQuestions.push({
      question: q.question,
      options: q.options,
      // correct_answer intentionally omitted
    });
    answersMap[i] = q.correct_answer;
  }

  return { questions: safeQuestions, answersMap };
}

/**
 * Validate quiz data before render.
 * Throws on any issue.
 */
export function validateQuizData(questions, answersMap) {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const correct = answersMap[i];

    if (!correct) {
      throw new Error(`Validation failed: Q${i + 1} has no correct answer mapped.`);
    }
    if (!q.options.includes(correct)) {
      throw new Error(
        `Validation failed: Q${i + 1} correct answer "${correct}" not found in options after build.`
      );
    }
  }
}

const useQuizStore = create((set, get) => ({
  // Raw parsed data (includes correct_answer — never sent to UI directly)
  weeksData: null,
  parseError: null,

  // Active quiz session
  mode: null, // 'week' | 'all'
  activeWeek: null,
  questions: [], // safe questions (no correct_answer field)
  answersMap: {}, // index -> correct_answer (never exposed to components directly)
  userAnswers: {}, // index -> selected option string
  submitted: false,
  score: null,
  quizError: null,
  seed: null,

  // Timer
  timeLeft: null,
  timerEnabled: false,

  setWeeksData: (data) => set({ weeksData: data, parseError: null }),
  setParseError: (err) => set({ parseError: err }),

  startWeekQuiz: (weekNumber) => {
    const { weeksData } = get();
    const weekData = weeksData?.weeks?.find((w) => w.week === weekNumber);
    if (!weekData) {
      set({ quizError: `Week ${weekNumber} data not found.` });
      return;
    }
    try {
      const { questions, answersMap } = buildWeekQuiz(weekData);
      validateQuizData(questions, answersMap);
      set({
        mode: "week",
        activeWeek: weekNumber,
        questions,
        answersMap,
        userAnswers: {},
        submitted: false,
        score: null,
        quizError: null,
        seed: null,
        timeLeft: null,
        timerEnabled: false,
      });
    } catch (e) {
      set({ quizError: e.message });
    }
  },

  startAllWeeksQuiz: (timerMinutes = 0) => {
    const { weeksData } = get();
    if (!weeksData) {
      set({ quizError: "No data loaded." });
      return;
    }
    try {
      const seed = Date.now();
      const { questions, answersMap } = buildAllWeeksQuiz(weeksData.weeks, seed);
      validateQuizData(questions, answersMap);
      set({
        mode: "all",
        activeWeek: null,
        questions,
        answersMap,
        userAnswers: {},
        submitted: false,
        score: null,
        quizError: null,
        seed,
        timeLeft: timerMinutes > 0 ? timerMinutes * 60 : null,
        timerEnabled: timerMinutes > 0,
      });
    } catch (e) {
      set({ quizError: e.message });
    }
  },

  setAnswer: (index, answer) => {
    const { submitted } = get();
    if (submitted) return;
    set((state) => ({
      userAnswers: { ...state.userAnswers, [index]: answer },
    }));
  },

  submitQuiz: () => {
    const { questions, answersMap, userAnswers, submitted } = get();
    if (submitted) return;

    let score = 0;
    for (let i = 0; i < questions.length; i++) {
      if (userAnswers[i] === answersMap[i]) score++;
    }

    set({ submitted: true, score });
  },

  tickTimer: () => {
    const { timeLeft, submitted } = get();
    if (submitted || timeLeft === null) return;
    if (timeLeft <= 1) {
      get().submitQuiz();
      set({ timeLeft: 0 });
    } else {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  resetQuiz: () =>
    set({
      mode: null,
      activeWeek: null,
      questions: [],
      answersMap: {},
      userAnswers: {},
      submitted: false,
      score: null,
      quizError: null,
      seed: null,
      timeLeft: null,
      timerEnabled: false,
    }),
}));

export default useQuizStore;
