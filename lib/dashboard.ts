// Numbers for the teacher dashboard, worked out from attempts, mastery and tutor chats.

import { db } from "./db";
import { mainUnits } from "@/data/topics";

// When a student is flagged as needing help
export const INACTIVE_DAYS = 7; // no login for this many days
export const WEAK_PERCENT = 50; // an objective below this percent

const DAY_MS = 24 * 60 * 60 * 1000;

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
    // Topic score = latest attempt at each question in the topic, added up.
    const topicScores: Record<string, number | null> = {};
    for (const topic of mainUnits) {
      const seen = new Set<string>();
      let score = 0;
      let max = 0;
      for (const attempt of student.attempts) {
        if (attempt.question.objective.subtopicId !== topic.key) continue;
        if (seen.has(attempt.questionId)) continue; // already counted a newer attempt
        seen.add(attempt.questionId);
        score += attempt.score;
        max += attempt.maxScore;
      }
      topicScores[topic.key] = max > 0 ? Math.round((score / max) * 100) : null;
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

  // Class weakest objectives: average percent across students who have attempted it.
  const objectives = await db.objective.findMany({
    where: { subtopicId: { in: mainUnits.map((t) => t.key) } },
    orderBy: { sortOrder: "asc" },
  });
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

  return {
    rows,
    needsHelp: rows.filter((r) => r.reasons.length > 0),
    activeThisWeek: rows.filter((r) => r.daysInactive !== null && r.daysInactive < INACTIVE_DAYS).length,
    totalObjectives: objectives.length,
    weakest,
  };
}
