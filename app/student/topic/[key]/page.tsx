import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { findBuiltTopic } from "@/data/topics";
import { TutorChat } from "@/components/TutorChat";
import { CheckQuiz } from "@/components/CheckQuiz";

// One topic for a student. The URL is /student/topic/1.1 or /student/topic/10.
// The guide is added in a later step.
export default async function TopicPage({ params }: { params: Promise<{ key: string }> }) {
  await requireUser("STUDENT");
  const { key } = await params;
  const topic = findBuiltTopic(key);
  if (!topic) notFound();

  // `select` picks only safe fields: the answer and mark scheme never reach the browser.
  const questions = await db.question.findMany({
    where: { objective: { subtopicId: topic.key } },
    select: { id: true, objectiveId: true, type: true, prompt: true, options: true, marks: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href="/student" className="text-sm text-blue-700">
        ← My topics
      </Link>
      <h1 className="text-2xl font-bold">
        {topic.key} {topic.title}
      </h1>
      <TutorChat topicKey={topic.key} />
      <CheckQuiz topicKey={topic.key} questions={questions} />
    </main>
  );
}
