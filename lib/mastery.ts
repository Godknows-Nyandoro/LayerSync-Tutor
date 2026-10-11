import { db } from "./db";

// A student has mastered an objective when they score at least 80%
// on the latest attempt at each of its questions.
export const MASTERY_THRESHOLD = 0.8;

// Recalculate one student's status on one objective from their check attempts.
// Called after every check, and by the seed script.
export async function updateMastery(studentId: string, objectiveId: string) {
  const attempts = await db.attempt.findMany({
    where: { studentId, question: { objectiveId } },
    orderBy: { createdAt: "desc" }, // newest first
  });

  // Keep only the newest attempt at each question, so a student who improves gets credit.
  const latestPerQuestion = new Map<string, (typeof attempts)[number]>();
  for (const attempt of attempts) {
    if (!latestPerQuestion.has(attempt.questionId)) {
      latestPerQuestion.set(attempt.questionId, attempt);
    }
  }

  let score = 0;
  let maxScore = 0;
  for (const attempt of latestPerQuestion.values()) {
    score += attempt.score;
    maxScore += attempt.maxScore;
  }

  if (maxScore === 0) return; // no attempts yet: stays "not started" (no row)

  const fraction = score / maxScore;
  const status = fraction >= MASTERY_THRESHOLD ? "MASTERED" : "LEARNING";
  const percent = Math.round(fraction * 100);

  await db.mastery.upsert({
    where: { studentId_objectiveId: { studentId, objectiveId } },
    create: { studentId, objectiveId, status, percent },
    update: { status, percent },
  });
}
