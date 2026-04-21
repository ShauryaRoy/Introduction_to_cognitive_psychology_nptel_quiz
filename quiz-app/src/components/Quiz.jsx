import { useState, useMemo } from "react";
import { buildQuiz } from "../lib/buildQuiz";
import quizData from "../data/questions.json";

export default function Quiz({ config, onBack }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [buildError, setBuildError] = useState(null);

  // Build quiz once on mount — answers array is NEVER rendered until after submit
  const quizState = useMemo(() => {
    try {
      return buildQuiz(config, quizData);
    } catch (e) {
      setBuildError(e.message);
      return null;
    }
  }, [config]);

  if (buildError) {
    return (
      <div className="quiz-error-page">
        <p className="error-msg">Failed to load quiz: {buildError}</p>
        <button className="btn-back" onClick={onBack}>Back</button>
      </div>
    );
  }

  if (!quizState) return null;

  const { questions, answers } = quizState;
  const total = questions.length;
  const answeredCount = Object.keys(userAnswers).length;

  const handleSelect = (qIndex, option) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    if (submitted) return;
    let s = 0;
    for (let i = 0; i < total; i++) {
      if (userAnswers[i] === answers[i]) s++;
    }
    setScore(s);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const title =
    config.type === "week"
      ? `Week ${config.weekNumber} — Practice`
      : "All Weeks Mock Test";

  return (
    <div className="quiz-page">
      <div className="quiz-topbar">
        <button className="btn-back" onClick={onBack}>
          Back
        </button>
        <span className="quiz-topbar-title">{title}</span>
        <span className="quiz-topbar-count">
          {submitted
            ? `Score: ${score} / ${total}`
            : `${answeredCount} / ${total} answered`}
        </span>
      </div>

      {submitted && (
        <div className="score-banner">
          <div className="score-number">
            {score} <span className="score-denom">/ {total}</span>
          </div>
          <div className="score-pct">
            {Math.round((score / total) * 100)}% correct
          </div>
        </div>
      )}

      <div className="questions-container">
        {questions.map((q, qi) => {
          const selected = userAnswers[qi];
          const correct = submitted ? answers[qi] : null;

          return (
            <div key={qi} className="question-block">
              <div className="question-header">
                <span className="q-num">Q{qi + 1}</span>
                <span className="q-text">{q.question}</span>
              </div>

              <div className="options">
                {q.options.map((opt, oi) => {
                  let cls = "option";
                  if (submitted) {
                    if (opt === correct) cls += " opt-correct";
                    else if (opt === selected) cls += " opt-wrong";
                  } else if (opt === selected) {
                    cls += " opt-selected";
                  }

                  return (
                    <label key={oi} className={cls}>
                      <input
                        type="radio"
                        name={`q${qi}`}
                        value={opt}
                        checked={selected === opt}
                        disabled={submitted}
                        onChange={() => handleSelect(qi, opt)}
                      />
                      <span className="opt-text">{opt}</span>
                    </label>
                  );
                })}
              </div>

              {submitted && (
                <div className="result-row">
                  {selected === correct ? (
                    <span className="result-tag correct">Correct</span>
                  ) : (
                    <>
                      <span className="result-tag wrong">Incorrect</span>
                      {!selected && (
                        <span className="result-note">Not answered</span>
                      )}
                      <span className="result-note">
                        Answer: <strong>{correct}</strong>
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <div className="quiz-footer">
          <div className="footer-info">
            {answeredCount < total && (
              <span className="unanswered-warn">
                {total - answeredCount} question{total - answeredCount > 1 ? "s" : ""} unanswered
              </span>
            )}
          </div>
          <button className="btn-submit" onClick={handleSubmit}>
            Submit Quiz
          </button>
        </div>
      ) : (
        <div className="quiz-footer">
          <button className="btn-back-home" onClick={onBack}>
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}
