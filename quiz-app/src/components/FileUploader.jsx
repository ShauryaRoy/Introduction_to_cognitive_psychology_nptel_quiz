import { useState, useRef } from "react";
import { parseDocxFile } from "../parser/parseDocx";
import useQuizStore from "../store/quizStore";

export default function FileUploader() {
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const setWeeksData = useQuizStore((s) => s.setWeeksData);
  const setParseError = useQuizStore((s) => s.setParseError);
  const weeksData = useQuizStore((s) => s.weeksData);

  const handleFileChange = (week, file) => {
    setFiles((prev) => ({ ...prev, [week]: file }));
  };

  const handleParse = async () => {
    setLoading(true);
    setLocalError(null);
    setParseError(null);

    try {
      const weeks = [];
      for (let w = 1; w <= 6; w++) {
        const file = files[w];
        if (!file) {
          throw new Error(`week${w}.docx is missing. Please upload all 6 week files.`);
        }
        const questions = await parseDocxFile(file, w);
        weeks.push({ week: w, questions });
      }
      setWeeksData({ weeks });
    } catch (e) {
      setLocalError(e.message);
      setParseError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uploader">
      <h2>Upload DOCX Files</h2>
      <p className="uploader-hint">Upload week1.docx through week6.docx to begin.</p>

      <div className="upload-grid">
        {[1, 2, 3, 4, 5, 6].map((w) => (
          <div key={w} className="upload-row">
            <label className="week-label">Week {w}</label>
            <input
              type="file"
              accept=".docx"
              onChange={(e) => handleFileChange(w, e.target.files[0])}
            />
            {files[w] && <span className="file-name">✓ {files[w].name}</span>}
          </div>
        ))}
      </div>

      {localError && <div className="error-box">{localError}</div>}

      <button
        className="btn btn-primary"
        onClick={handleParse}
        disabled={loading || Object.keys(files).length < 6}
      >
        {loading ? "Parsing..." : "Load Questions"}
      </button>

      {weeksData && !localError && (
        <div className="success-box">
          All files parsed successfully!{" "}
          {weeksData.weeks.reduce((a, w) => a + w.questions.length, 0)} questions loaded.
        </div>
      )}
    </div>
  );
}
