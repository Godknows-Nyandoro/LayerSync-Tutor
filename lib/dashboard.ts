// Numbers for the teacher dashboard, worked out from attempts, mastery and tutor chats.

import { db } from "./db";
import { units } from "@/data/topics";

// When a student is flagged as needing help
export const INACTIVE_DAYS = 7; // no login for this many days
export const WEAK_PERCENT = 50; // an objective below this percent

const DAY_MS = 24 * 60 * 60 * 1000;

export const FLAG_REASON_LABEL = {
  WRONG: "Wrong",
  CONFUSING: "Confusing",
  GAVE_ANSWER: "Gave away the answer",
  OTHER: "Other",
};

export function daysSince(date: Date | null) {
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / DAY_MS);
}

export async function getClassDashboard(className: string) {
  // Only students in the teacher's own class.
  const students = await db.user.findMany({
    where: { role: "STUDENT", className },
    orderBy: { name: "asc" },
    include: {
      mastery: true,
      attempts: {
        orderBy: { createdAt: "desc" }, // newest first
        include: { question: { select: { objective: { select: { subtopicId: true } } } } },
      },
      tutorSessions: { select: { createdAt: true } },
    },
  });

  const rows = students.map((student) => {
    // Unit score = latest attempt at each question in the unit, added up.
    // Attempts are newest first, so the first time we see a question is its latest attempt.
    const seen = new Set<string>();
    const totals: Record<string, { score: number; max: number }> = {};
    for (const attempt of student.attempts) {
      if (seen.has(attempt.questionId)) continue; // already counted a newer attempt
      seen.add(attempt.questionId);
      const unitKey = attempt.question.objective.subtopicId;
      totals[unitKey] ??= { score: 0, max: 0 };
      totals[unitKey].score += attempt.score;
      totals[unitKey].max += attempt.maxScore;
    }
    // A unit the student has not tried is null ("Not started").
    const topicScores: Record<string, number | null> = {};
    for (const unit of units) {
      const total = totals[unit.key];
      topicScores[unit.key] = total ? Math.round((total.score / total.max) * 100) : null;
    }

    const daysInactive = daysSince(student.lastLoginAt);
    const weakObjectives = student.mastery
      .filter((m) => m.percent < WEAK_PERCENT)
      .sort((a, b) => a.percent - b.percent);
    const tutorChatsThisWeek = student.tutorSessions.filter(
      (s) => Date.now() - s.createdAt.getTime() < 7 * DAY_MS,
    ).length;

    // Plain-English reasons, so the teacher sees WHY a student is flagged.
    const reasons: string[] = [];
    if (daysInactive === null || daysInactive >= INACTIVE_DAYS) {
      reasons.push(daysInactive === null ? "Never logged in" : `No login for ${daysInactive} days`);
    }
    for (const m of weakObjectives) {
      reasons.push(`Weak on ${m.objectiveId} (${m.percent}%)`);
    }

    return {
      id: student.id,
      name: student.name,
      code: student.studentCode,
      daysInactive,
      topicScores,
      masteredCount: student.mastery.filter((m) => m.status === "MASTERED").length,
      tutorChatsThisWeek,
      reasons,
    };
  });

  // Every unit, for the "All topics" table: class average of the students who have tried it.
  const unitSummaries = units.map((unit) => {
    const scores = rows.map((r) => r.topicScores[unit.key]).filter((s): s is number => s !== null);
    const average = scores.length ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : null;
    return { ...unit, studentsTried: scores.length, average };
  });

  // Class weakest objectives (across the whole syllabus): average percent of the students who tried it.
  const objectives = await db.objective.findMany({ orderBy: { sortOrder: "asc" } });
  const weakest = objectives
    .map((objective) => {
      const rowsForObjective = students.flatMap((s) => s.mastery.filter((m) => m.objectiveId === objective.id));
      const attempted = rowsForObjective.length;
      const average = attempted
        ? Math.round(rowsForObjective.reduce((sum, m) => sum + m.percent, 0) / attempted)
        : null;
      const mastered = rowsForObjective.filter((m) => m.status === "MASTERED").length;
      return { id: objective.id, statement: objective.statement, attempted, average, mastered };
    })
    .filter((o) => o.average !== null)
    .sort((a, b) => a.average! - b.average!)
    .slice(0, 5);

  // Tutor replies flagged by students in this class that the teacher has not reviewed yet.
  const openFlags = await db.tutorFlag.findMany({
    where: { status: "OPEN", student: { className } },
    include: { student: { select: { name: true } }, session: { select: { topicKey: true } } },
    orderBy: { createdAt: "desc" },
  });

  return {
    rows,
    openFlags,
    needsHelp: rows.filter((r) => r.reasons.length > 0),
    activeThisWeek: rows.filter((r) => r.daysInactive !== null && r.daysInactive < INACTIVE_DAYS).length,
    totalObjectives: objectives.length,
    unitSummaries,
    weakest,
  };
}
