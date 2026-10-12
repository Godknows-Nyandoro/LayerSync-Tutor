"use client";
// The check: one question per screen, then a results screen with marks and feedback.
// Runs in the browser so it can move between questions and show the results.

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronDown, CircleAlert, CircleCheck, CircleX, LoaderCircle, MessageCircle, RotateCcw, Trophy } from "lucide-react";
import { MasteryChip, type Status } from "./MasteryChip";
import { ProgressBar } from "./ui/ProgressBar";
import { buttonPrimary, buttonSecondary, card } from "./ui/styles";

// Only what the student needs to see: no answers or mark schemes.
export type QuizQuestion = {
  id: string;
  objectiveId: string;
  type: "MCQ" | "SHORT";
  prompt: string;
  options: string[];
  marks: number;
};

type Result = { questionId: string; answer: string; score: number; maxScore: number; feedback: string };
type MasteryRow = { objectiveId: string; status: Status; percent: number };

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function CheckQuiz({ topicKey, questions }: { topicKey: string; questions: QuizQuestion[] }) {
  const [index, setIndex] = useState(0); // which question is on screen
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"answering" | "marking" | "done">("answering");
  const [results, setResults] = useState<Result[]>([]);
  const [mastery, setMastery] = useState<MasteryRow[]>([]);
  const [error, setError] = useState("");
  const topRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  if (questions.length === 0) {
    return <p className={`${card} text-slate-600`}>There is no check for this topic yet.</p>;
  }

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const unanswered = questions.filter((q) => !answers[q.id]?.trim()).length;

  function setAnswer(value: string) {
    setAnswers((old) => ({ ...old, [question.id]: value }));
  }

  function goTo(newIndex: number) {
    setIndex(newIndex);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit() {
    setPhase("marking");
    setError("");

    let data;
    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicKey, answers }),
      });
      data = await response.json();
      if (!response.ok) throw new Error(data.error);
    } catch {
      // Usually the free database waking up. The answers are still on screen, so nothing is lost.
      setError(
        "Sorry, the system is a little busy. We use a free database that can take a few seconds to wake up. Your answers are still here: please press Submit again.",
      );
      setPhase("answering");
      return;
    }
    setResults(data.results);
    setMastery(data.mastery);
    setPhase("done");
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Reload the server parts of the page (progress bar, Progress tab) without losing this screen.
    router.refresh();
  }

  function tryAgain() {
    setAnswers({});
    setResults([]);
    setMastery([]);
    setIndex(0);
    setPhase("answering");
  }

  // ---------- Marking: short answers are marked by AI, which takes a few seconds ----------
  if (phase === "marking") {
    return (
      <div ref={topRef} className={`${card} scroll-mt-20 py-12 text-center`}>
        <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-orange-600" aria-hidden />
        <p className="mt-3 font-medium">Marking your answers...</p>
        <p className="text-sm text-slate-500">Short answers are checked against the mark scheme.</p>
      </div>
    );
  }

  // ---------- Results screen ----------
  if (phase === "done") {
    const score = results.reduce((sum, r) => sum + r.score, 0);
    const total = results.reduce((sum, r) => sum + r.maxScore, 0);
    const percent = total ? Math.round((score / total) * 100) : 0;
    const message =
      percent >= 80 ? "Excellent work!" : percent >= 50 ? "Good effort. Keep going!" : "Keep practising. You've got this.";

    return (
      <div ref={topRef} className="scroll-mt-20 space-y-4">
        <div className={`${card} text-center`}>
          <Trophy className={`mx-auto h-10 w-10 ${percent >= 80 ? "text-amber-500" : "text-slate-300"}`} aria-hidden />
          <p className="mt-2 text-4xl font-bold">{percent}%</p>
          <p className="text-slate-600">
            {score} out of {total} marks · {message}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {mastery.map((row) => (
              <span key={row.objectiveId} className="inline-flex items-center gap-1.5 text-sm">
                <span className="font-mono text-xs text-slate-500">{row.objectiveId}</span>
                <MasteryChip status={row.status} percent={row.percent} />
              </span>
            ))}
          </div>
        </div>

        <h3 className="font-semibold">Your answers</h3>
        <div className="space-y-2">
          {questions.map((q, i) => {
            const result = results.find((r) => r.questionId === q.id);
            if (!result) return null;
            const full = result.score === result.maxScore;
            const Icon = full ? CircleCheck : result.score > 0 ? CircleAlert : CircleX;
            const color = full ? "text-green-600" : result.score > 0 ? "text-amber-500" : "text-red-500";
            return (
              <details key={q.id} className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                  <Icon className={`h-5 w-5 shrink-0 ${color}`} aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {i + 1}. {q.prompt}
                  </span>
                  <span className="shrink-0 text-sm font-semibold">
                    {result.score}/{result.maxScore}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <div className="space-y-2 border-t border-slate-100 p-4 text-sm">
                  <p className="text-slate-700">{q.prompt}</p>
                  <p>
                    <span className="font-medium">Your answer: </span>
                    <span className="whitespace-pre-wrap text-slate-700">{result.answer || "(no answer)"}</span>
                  </p>
                  <p className={`rounded-xl p-3 ${full ? "bg-green-50 text-green-900" : "bg-amber-50 text-amber-900"}`}>
                    {result.feedback}
                  </p>
                </div>
              </details>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={tryAgain} className={buttonSecondary}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Try the check again
          </button>
          <Link
            href={`/student/tutor?topic=${topicKey}&back=${encodeURIComponent(`/student/topic/${topicKey}?tab=check`)}`}
            className={buttonPrimary}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Ask the tutor about my mistakes
          </Link>
        </div>
      </div>
    );
  }

  // ---------- One question on screen ----------
  return (
    <div ref={topRef} className="scroll-mt-20 space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-600">
            Question {index + 1} of {questions.length}
          </span>
          <span className="text-slate-500">No calculators: work it out by hand</span>
        </div>
        <ProgressBar percent={((index + 1) / questions.length) * 100} color="bg-orange-600" />
      </div>

      <div className={card}>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-slate-600">{question.objectiveId}</span>
          <span className="font-medium text-slate-500">
            {question.marks} {question.marks === 1 ? "mark" : "marks"}
          </span>
        </div>
        <p className="mt-3 text-lg font-medium leading-snug">{question.prompt}</p>

        {question.type === "MCQ" ? (
          <div className="mt-4 space-y-2" role="radiogroup">
            {question.options.map((option, i) => {
              const selected = answers[question.id] === option;
              return (
                <button
                  key={option}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setAnswer(option)}
                  className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left text-base transition-colors ${
                    selected ? "border-orange-600 bg-orange-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      selected ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {LETTERS[i]}
                  </span>
                  <span className="pt-0.5">{option}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <textarea
            value={answers[question.id] ?? ""}
            onChange={(e) => setAnswer(e.target.value)}
            maxLength={1000}
            rows={5}
            placeholder="Write your answer and show your working"
            aria-label="Your answer"
            className="mt-4 w-full rounded-xl border border-slate-300 p-3 text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        )}
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {isLast && unanswered > 0 && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          You have {unanswered} unanswered {unanswered === 1 ? "question" : "questions"}. You can still submit.
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <button onClick={() => goTo(index - 1)} disabled={index === 0} className={buttonSecondary}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        {isLast ? (
          <button onClick={submit} className={buttonPrimary}>
            Submit answers
            <CircleCheck className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button onClick={() => goTo(index + 1)} className={buttonPrimary}>
            Next
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
