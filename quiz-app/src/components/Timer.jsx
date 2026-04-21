import { useEffect } from "react";
import useQuizStore from "../store/quizStore";

export default function Timer() {
  const timeLeft = useQuizStore((s) => s.timeLeft);
  const timerEnabled = useQuizStore((s) => s.timerEnabled);
  const submitted = useQuizStore((s) => s.submitted);
  const tickTimer = useQuizStore((s) => s.tickTimer);

  useEffect(() => {
    if (!timerEnabled || submitted) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [timerEnabled, submitted, tickTimer]);

  if (!timerEnabled || timeLeft === null) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft <= 60;

  return (
    <div className={`timer ${isWarning ? "timer-warning" : ""}`}>
      ⏱ {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}
