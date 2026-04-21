import useQuizStore from "../store/quizStore";
import Timer from "./Timer";

export default function QuizView() {
  const questions = useQuizStore((s) => s.questions);
  const userAnswers = useQuizStore((s) => s.userAnswers);
  const submitted = useQuizStore((s) => s.submitted);
  const score = useQuizStore((s) => s.score);
  const answersMap = useQuizStore((s) => s.answersMap);
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const submitQuiz = useQuizStore((s) => s.submitQuiz);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);
  const mode = useQuizStore((s) => s.mode);
  const activeWeek = useQuizStore((s) => s.activeWeek);
  const quizError = useQuizStore((s) => s.quizError);

  if (quizError) {
    return (
      <div className="quiz-error">
        <h2>Quiz Error</h2>
        <div className="error-box">{quizError}</div>
        <button className="btn btn-secondary" onClick={resetQuiz}>
          Go Back
        </button>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const answeredCount = Object.keys(userAnswers).length;
  const totalCount = questions.length;

  return (
    <div className="quiz-view">
      <div className="quiz-header">
        <div className="quiz-title">
          {mode === "week" ? `Week ${activeWeek} Practice` : "All Weeks Mock Test"}
        </div>
        <div className="quiz-meta">
          <span>
            Answered: {answeredCount} / {totalCount}
          </span>
          <Timer />
        </div>
      </div>

      <div className="questions-list">
        {questions.map((q, idx) => {
          const userAns = userAnswers[idx];
          const correctAns = submitted ? answersMap[idx] : null; // only reveal after submit

          return (
            <div
              key={idx}
              className={`question-card ${submitted ? "question-card--reviewed" : ""}`}
            >
              <div className="question-number">Q{idx + 1}.</div>
              <div className="question-text">{q.question}</div>

              <div className="options-list">
                {q.options.map((opt, optIdx) => {
                  let optClass = "option";
                  if (submitted) {
                    if (opt === correctAns) optClass += " option--correct";
                    else if (opt === userAns && opt !== correctAns)
                      optClass += " option--wrong";
                  } else if (opt === userAns) {
                    optClass += " option--selected";
                  }

                  return (
                    <label key={optIdx} className={optClass}>
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        value={opt}
                        checked={userAns === opt}
                        disabled={submitted}
                        onChange={() => setAnswer(idx, opt)}
                      />
                      <span className="option-text">{opt}</span>
                    </label>
                  );
                })}
              </div>

              {submitted && (
                <div className="review-row">
                  <span
                    className={
                      userAns === correctAns ? "review-correct" : "review-wrong"
                    }
                  >
                    {userAns === correctAns ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                  {userAns !== correctAns && (
                    <span className="review-correct-label">
                      Correct answer: {correctAns}
                    </span>
                  )}
                  {!userAns && <span className="review-unanswered"> (Not answered)</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="quiz-footer">
          <button className="btn btn-primary btn-submit" onClick={submitQuiz}>
            Submit Quiz
          </button>
          <button className="btn btn-danger" onClick={resetQuiz}>
            Abandon Quiz
          </button>
        </div>
      )}

      {submitted && (
        <div className="score-panel">
          <h2>Quiz Complete!</h2>
          <div className="score-display">
            Score: <strong>{score}</strong> / {totalCount}
          </div>
          <div className="score-percent">
            {Math.round((score / totalCount) * 100)}%
          </div>
          <button className="btn btn-primary" onClick={resetQuiz}>
            Back to Menu
          </button>
        </div>
      )}
    </div>
  );
}
