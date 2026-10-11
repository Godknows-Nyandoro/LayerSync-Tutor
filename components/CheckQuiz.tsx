"use client";
// The check: a short quiz. Runs in the browser so it can show marks and feedback after submitting.

import { useState } from "react";

// Only what the student needs to see: no answers or mark schemes.
export type QuizQuestion = {
  id: string;
  objectiveId: string;
  type: "MCQ" | "SHORT";
  prompt: string;
  options: string[];
  marks: number;
};

type Result = { questionId: string; score: number; maxScore: number; feedback: string };
type MasteryRow = { objectiveId: string; status: string; percent: number };

const STATUS_LABEL: Record<string, string> = { LEARNING: "Learning", MASTERED: "Mastered ✅" };

export function CheckQuiz({ topicKey, questions }: { topicKey: string; questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, Result> | null>(null);
  const [mastery, setMastery] = useState<MasteryRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function setAnswer(questionId: string, value: string) {
    setAnswers((old) => ({ ...old, [questionId]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const response = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicKey, answers }),
    });
    const data = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(data.error);
      return;
    }
    // Turn the list of results into a lookup by question id.
    setResults(Object.fromEntries(data.results.map((r: Result) => [r.questionId, r])));
    setMastery(data.mastery);
  }

  function tryAgain() {
    setAnswers({});
    setResults(null);
    setMastery([]);
  }

  const totalScore = results ? Object.values(results).reduce((sum, r) => sum + r.score, 0) : 0;
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <section className="rounded-lg border bg-white p-3">
      <h2 className="font-semibold">Check your understanding</h2>
      <p className="text-xs text-gray-500">Work it out by hand: no calculators in the exam.</p>

      <form onSubmit={submit} className="mt-3 space-y-4">
        {questions.map((question, index) => {
          const result = results?.[question.id];
          return (
            <div key={question.id} className="rounded border p-3">
              <p className="text-sm font-medium">
                {index + 1}. {question.prompt}{" "}
                <span className="text-gray-500">
                  [{question.marks} mark{question.marks > 1 ? "s" : ""}]
                </span>
              </p>

              {question.type === "MCQ" ? (
                <div className="mt-2 space-y-1">
                  {question.options.map((option) => (
                    <label key={option} className="flex items-start gap-2 text-sm">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => setAnswer(question.id, option)}
                        disabled={!!results}
                        className="mt-1"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[question.id] ?? ""}
                  onChange={(e) => setAnswer(question.id, e.target.value)}
                  disabled={!!results}
                  maxLength={1000}
                  rows={3}
                  placeholder="Show your working"
                  className="mt-2 w-full rounded border p-2 text-sm"
                />
              )}

              {result && (
                <p
                  className={`mt-2 rounded p-2 text-sm ${
                    result.score === result.maxScore ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"
                  }`}
                >
                  <strong>
                    {result.score}/{result.maxScore}.
                  </strong>{" "}
                  {result.feedback}
                </p>
              )}
            </div>
          );
        })}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!results && (
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded bg-blue-700 p-2 font-medium text-white disabled:opacity-60"
          >
            {busy ? "Marking..." : "Submit answers"}
          </button>
        )}
      </form>

      {results && (
        <div className="mt-4 rounded bg-gray-50 p-3 text-sm">
          <p className="font-semibold">
            Score: {totalScore} / {totalMarks}
          </p>
          <ul className="mt-2 space-y-1">
            {mastery.map((row) => (
              <li key={row.objectiveId}>
                <span className="font-mono">{row.objectiveId}</span>: {STATUS_LABEL[row.status]} ({row.percent}%)
              </li>
            ))}
          </ul>
          <button onClick={tryAgain} className="mt-3 text-blue-700 underline">
            Try the check again
          </button>
        </div>
      )}
    </section>
  );
}
