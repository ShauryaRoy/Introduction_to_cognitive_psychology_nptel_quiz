import useQuizStore from "../store/quizStore";

export default function ModeSelector() {
  const weeksData = useQuizStore((s) => s.weeksData);
  const startWeekQuiz = useQuizStore((s) => s.startWeekQuiz);
  const startAllWeeksQuiz = useQuizStore((s) => s.startAllWeeksQuiz);

  if (!weeksData) return null;

  return (
    <div className="mode-selector">
      <h2>Select Quiz Mode</h2>

      <div className="mode-cards">
        <div className="mode-card">
          <h3>Week-wise Practice</h3>
          <p>Study questions from a specific week, in original order.</p>
          <div className="week-buttons">
            {weeksData.weeks.map((w) => (
              <button
                key={w.week}
                className="btn btn-secondary"
                onClick={() => startWeekQuiz(w.week)}
              >
                Week {w.week} ({w.questions.length} Qs)
              </button>
            ))}
          </div>
        </div>

        <div className="mode-card">
          <h3>All Weeks Mock Test</h3>
          <p>
            Randomized test with all{" "}
            {weeksData.weeks.reduce((a, w) => a + w.questions.length, 0)} questions.
          </p>
          <div className="mock-options">
            <button
              className="btn btn-primary"
              onClick={() => startAllWeeksQuiz(0)}
            >
              Start (No Timer)
            </button>
            <button
              className="btn btn-primary"
              onClick={() => startAllWeeksQuiz(30)}
            >
              Start (30 min timer)
            </button>
            <button
              className="btn btn-primary"
              onClick={() => startAllWeeksQuiz(60)}
            >
              Start (60 min timer)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
