import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { daysSince } from "@/lib/dashboard";
import { mainUnits } from "@/data/topics";
import { MasteryChip } from "@/components/MasteryChip";

export const dynamic = "force-dynamic";

// One student, as seen by their teacher: mastery per objective and their latest check answers.
export default async function StudentDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser("TEACHER");
  const teacher = await db.user.findUniqueOrThrow({ where: { id: session.userId } });
  const { id } = await params;

  // The className filter means a teacher can only open students in their own class.
  const student = await db.user.findFirst({
    where: { id, role: "STUDENT", className: teacher.className },
    include: {
      mastery: true,
      attempts: { orderBy: { createdAt: "desc" }, take: 15, include: { question: true } },
      _count: { select: { tutorSessions: true } },
    },
  });
  if (!student) notFound();

  const objectives = await db.objective.findMany({
    where: { subtopicId: { in: mainUnits.map((t) => t.key) } },
    orderBy: { sortOrder: "asc" },
  });
  const masteryByObjective = new Map(student.mastery.map((m) => [m.objectiveId, m]));
  const days = daysSince(student.lastLoginAt);

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      <Link href="/teacher" className="text-sm text-blue-700">
        ← Class dashboard
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{student.name}</h1>
        <p className="text-sm text-gray-600">
          {student.studentCode} · Last login: {days === null ? "never" : days === 0 ? "today" : `${days} days ago`} ·{" "}
          {student._count.tutorSessions} tutor chats
        </p>
      </div>

      <section className="rounded-lg border bg-white p-3">
        <h2 className="font-semibold">Mastery</h2>
        <ul className="mt-2 space-y-2">
          {objectives.map((objective) => {
            const row = masteryByObjective.get(objective.id);
            return (
              <li key={objective.id} className="flex items-start justify-between gap-2 text-sm">
                <span>
                  <span className="font-mono font-semibold">{objective.id}</span> {objective.statement}
                </span>
                <MasteryChip status={row?.status ?? "NOT_STARTED"} percent={row?.percent} />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-lg border bg-white p-3">
        <h2 className="font-semibold">Latest answers</h2>
        <ul className="mt-2 space-y-3">
          {student.attempts.map((attempt) => (
            <li key={attempt.id} className="border-t pt-2 text-sm">
              <p className="font-medium">{attempt.question.prompt}</p>
              <p className="text-gray-700">Answer: {attempt.answer || "(blank)"}</p>
              <p>
                <strong>
                  {attempt.score}/{attempt.maxScore}
                </strong>{" "}
                <span className="text-gray-600">{attempt.feedback}</span>
              </p>
              <p className="text-xs text-gray-400">{attempt.createdAt.toLocaleDateString("en-GB")}</p>
            </li>
          ))}
          {student.attempts.length === 0 && <li className="text-sm text-gray-600">No checks taken yet.</li>}
        </ul>
      </section>
    </main>
  );
}
