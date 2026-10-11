// POST /api/check
// Body: { topicKey, answers: { [questionId]: answer } }
// Marks every question in the topic's check, saves the attempts, updates mastery
// and returns the marks, feedback and new mastery status.

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { findBuiltTopic } from "@/data/topics";
import { getApprovedGuideText } from "@/lib/guides";
import { MAX_ANSWER_CHARS, markMcq, markShortAnswer } from "@/lib/marking";
import { updateMastery } from "@/lib/mastery";

export async function POST(request: Request) {
  // 1. Only logged-in students can take a check.
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return Response.json({ error: "Please log in as a student." }, { status: 401 });
  }

  // 2. Check the input.
  const body = await request.json();
  const topic = findBuiltTopic(String(body.topicKey));
  if (!topic) return Response.json({ error: "Unknown topic." }, { status: 400 });
  const answers: Record<string, string> = body.answers ?? {};

  // 3. Load the questions from the database (the browser never sees the answers or mark schemes).
  const questions = await db.question.findMany({
    where: { objective: { subtopicId: topic.key } },
    include: { objective: true },
    orderBy: { sortOrder: "asc" },
  });
  const guideText = await getApprovedGuideText(topic.key);

  // 4. Mark every question. Short answers are marked by AI at the same time (in parallel).
  const results = await Promise.all(
    questions.map(async (question) => {
      const answer = String(answers[question.id] ?? "").slice(0, MAX_ANSWER_CHARS);
      const { score, feedback } =
        question.type === "MCQ"
          ? markMcq(question, answer)
          : await markShortAnswer(question, question.objective, answer, guideText);
      return { questionId: question.id, objectiveId: question.objectiveId, answer, score, maxScore: question.marks, feedback };
    }),
  );

  // 5. Save the attempts, then recalculate mastery for each objective in this check.
  await db.attempt.createMany({
    data: results.map((r) => ({
      studentId: session.userId,
      questionId: r.questionId,
      answer: r.answer,
      score: r.score,
      maxScore: r.maxScore,
      feedback: r.feedback,
    })),
  });

  const objectiveIds = [...new Set(results.map((r) => r.objectiveId))];
  for (const objectiveId of objectiveIds) {
    await updateMastery(session.userId, objectiveId);
  }

  const mastery = await db.mastery.findMany({
    where: { studentId: session.userId, objectiveId: { in: objectiveIds } },
  });

  return Response.json({ results, mastery });
}
