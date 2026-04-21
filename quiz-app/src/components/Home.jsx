import quizData from "../data/questions.json";

export default function Home({ onStart }) {
  const totalQuestions = quizData.weeks.reduce(
    (sum, w) => sum + w.questions.length,
    0
  );

  return (
    <div className="home">
      <div className="home-hero">
        <p className="home-subtitle">Cognitive Psychology</p>
        <h1 className="home-title">Quiz Practice</h1>
        <p className="home-desc">
          Select a week to practice or take a combined mock test.
        </p>
      </div>

      <section className="week-grid">
        {quizData.weeks.map((w) => (
          <button
            key={w.week}
            className="week-card"
            onClick={() => onStart({ type: "week", weekNumber: w.week })}
          >
            <span className="week-card-label">Week {w.week}</span>
            <span className="week-card-count">{w.questions.length} questions</span>
          </button>
        ))}
      </section>

      <div className="allweeks-wrap">
        <button
          className="btn-allweeks"
          onClick={() => onStart({ type: "all" })}
        >
          All Weeks Mock Test
          <span className="btn-allweeks-sub">{totalQuestions} questions — shuffled</span>
        </button>
      </div>
    </div>
  );
}
