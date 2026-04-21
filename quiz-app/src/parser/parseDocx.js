import mammoth from "mammoth";

/**
 * Parse a DOCX file (File object) and extract MCQ questions.
 * Expected format per question:
 *   - A paragraph starting with the question text (may be numbered)
 *   - Bullet/list items for options
 *   - A paragraph containing "Answer:" or "Correct Answer:" followed by the answer text
 *
 * Returns: Array of { question, options, correct_answer }
 * Throws on any parsing failure or answer mismatch.
 */
export async function parseDocxFile(file, weekNumber) {
  const arrayBuffer = await file.arrayBuffer();

  // Extract raw text preserving paragraph breaks
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value;

  if (!rawText || rawText.trim().length === 0) {
    throw new Error(`Week ${weekNumber}: DOCX file is empty or unreadable.`);
  }

  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const questions = extractQuestions(lines, weekNumber);

  if (questions.length === 0) {
    throw new Error(`Week ${weekNumber}: No questions could be parsed from the file.`);
  }

  // Validate every question
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    validateQuestion(q, weekNumber, i + 1);
  }

  return questions;
}

/**
 * State machine parser:
 * States: SEEK_QUESTION → COLLECT_OPTIONS → SEEK_ANSWER
 */
function extractQuestions(lines, weekNumber) {
  const questions = [];
  let state = "SEEK_QUESTION";
  let currentQuestion = null;

  const answerPrefixes = [
    /^answer\s*:/i,
    /^correct\s*answer\s*:/i,
    /^ans\s*:/i,
    /^correct\s*:/i,
  ];

  // Detect if a line looks like an option (lettered or bulleted)
  const optionPrefixes = [
    /^[a-dA-D][.)]\s+/,   // A. B) C. D)
    /^[•\-–—*]\s+/,        // bullet
    /^\d+[.)]\s+/,         // numbered options (rare)
  ];

  const isOptionLine = (line) => optionPrefixes.some((r) => r.test(line));
  const isAnswerLine = (line) => answerPrefixes.some((r) => r.test(line));

  // Strip option prefix (e.g. "A. ", "B) ", "• ")
  const stripOptionPrefix = (line) => {
    return line
      .replace(/^[a-dA-D][.)]\s+/, "")
      .replace(/^[•\-–—*]\s+/, "")
      .replace(/^\d+[.)]\s+/, "")
      .trim();
  };

  const stripAnswerPrefix = (line) => {
    return line
      .replace(/^answer\s*:\s*/i, "")
      .replace(/^correct\s*answer\s*:\s*/i, "")
      .replace(/^ans\s*:\s*/i, "")
      .replace(/^correct\s*:\s*/i, "")
      .trim();
  };

  // Detect question start: numbered "1." / "Q1." / "Question 1" or plain sentence
  const isQuestionStart = (line) => {
    return (
      /^\d+[.)]\s+\S/.test(line) ||
      /^Q\s*\d+[.)]\s+\S/i.test(line) ||
      /^Question\s+\d+/i.test(line)
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (state === "SEEK_QUESTION") {
      if (isQuestionStart(line)) {
        // Strip numeric prefix
        const questionText = line
          .replace(/^\d+[.)]\s+/, "")
          .replace(/^Q\s*\d+[.)]\s+/i, "")
          .replace(/^Question\s+\d+\s*[.:)]\s*/i, "")
          .trim();

        currentQuestion = { question: questionText, options: [], correct_answer: null };
        state = "COLLECT_OPTIONS";
      }
    } else if (state === "COLLECT_OPTIONS") {
      if (isAnswerLine(line)) {
        const ans = stripAnswerPrefix(line);
        if (ans.length > 0) {
          currentQuestion.correct_answer = ans;
        }
        state = "SEEK_ANSWER_DONE";
      } else if (isOptionLine(line)) {
        currentQuestion.options.push(stripOptionPrefix(line));
      } else if (isQuestionStart(line)) {
        // New question started without an answer line — treat as error later in validation
        questions.push(currentQuestion);
        const questionText = line
          .replace(/^\d+[.)]\s+/, "")
          .replace(/^Q\s*\d+[.)]\s+/i, "")
          .replace(/^Question\s+\d+\s*[.:)]\s*/i, "")
          .trim();
        currentQuestion = { question: questionText, options: [], correct_answer: null };
        state = "COLLECT_OPTIONS";
      }
      // else: ignore unrecognized lines between options
    } else if (state === "SEEK_ANSWER_DONE") {
      // Answer may be on the next line if the prefix was alone
      if (currentQuestion.correct_answer === null || currentQuestion.correct_answer === "") {
        if (!isAnswerLine(line) && !isOptionLine(line) && !isQuestionStart(line)) {
          currentQuestion.correct_answer = line.trim();
        }
      }

      if (isQuestionStart(line)) {
        questions.push(currentQuestion);
        const questionText = line
          .replace(/^\d+[.)]\s+/, "")
          .replace(/^Q\s*\d+[.)]\s+/i, "")
          .replace(/^Question\s+\d+\s*[.:)]\s*/i, "")
          .trim();
        currentQuestion = { question: questionText, options: [], correct_answer: null };
        state = "COLLECT_OPTIONS";
      } else if (isAnswerLine(line)) {
        // another answer line — shouldn't happen, but handle it
        const ans = stripAnswerPrefix(line);
        if (ans.length > 0) currentQuestion.correct_answer = ans;
      } else {
        state = "SEEK_QUESTION";
        questions.push(currentQuestion);
        currentQuestion = null;
      }
    }
  }

  // Push last question
  if (currentQuestion && currentQuestion.question) {
    questions.push(currentQuestion);
  }

  return questions;
}

function validateQuestion(q, weekNumber, qIndex) {
  if (!q.question || q.question.trim() === "") {
    throw new Error(`Week ${weekNumber}, Q${qIndex}: Empty question text.`);
  }
  if (!q.options || q.options.length < 2) {
    throw new Error(
      `Week ${weekNumber}, Q${qIndex}: "${q.question.substring(0, 40)}..." has fewer than 2 options.`
    );
  }
  if (!q.correct_answer || q.correct_answer.trim() === "") {
    throw new Error(
      `Week ${weekNumber}, Q${qIndex}: "${q.question.substring(0, 40)}..." has no correct answer.`
    );
  }

  // Exact match check
  const exactMatch = q.options.find((o) => o === q.correct_answer);

  // Case-insensitive fallback — still error if no case-insensitive match
  const caseInsensitiveMatch = q.options.find(
    (o) => o.toLowerCase() === q.correct_answer.toLowerCase()
  );

  if (!exactMatch) {
    if (caseInsensitiveMatch) {
      // Normalize to exact option text
      q.correct_answer = caseInsensitiveMatch;
    } else {
      throw new Error(
        `Week ${weekNumber}, Q${qIndex}: correct_answer "${q.correct_answer}" does not match any option.\nOptions: ${q.options.join(" | ")}`
      );
    }
  }
}
