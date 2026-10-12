import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { findUnit } from "@/data/topics";
import type { GuideSection } from "@/data/guides";
import { GuideView } from "@/components/GuideView";
import { TutorChat } from "@/components/TutorChat";
import { CheckQuiz } from "@/components/CheckQuiz";

export const dynamic = "force-dynamic";

// One unit for a student: learn (guide) -> practise (tutor) -> check (questions).
// The URL is /student/topic/<unit key>, e.g. /student/topic/1.1 or /student/topic/10.
export default async function TopicPage({ params }: { params: Promise<{ key: string }> }) {
  await requireUser("STUDENT");
  const { key } = await params;
  const topic = findUnit(key);
  if (!topic) notFound();

  // status: "APPROVED" means a draft guide is never sent to a student.
  const guide = await db.guide.findFirst({ where: { topicKey: topic.key, status: "APPROVED" } });

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

      <section>
        <h2 className="mb-2 font-semibold">1. Learn</h2>
        {guide ? (
          <GuideView sections={guide.sections as GuideSection[]} />
        ) : (
          <p className="rounded-lg border bg-white p-3 text-sm text-gray-600">
            Your teacher has not released the guide for this topic yet.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-semibold">2. Practise</h2>
        <TutorChat topicKey={topic.key} />
      </section>

      <section>
        <h2 className="mb-2 font-semibold">3. Check</h2>
        <CheckQuiz topicKey={topic.key} questions={questions} />
      </section>
    </main>
  );
}
