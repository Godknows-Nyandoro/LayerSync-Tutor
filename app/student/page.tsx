import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { builtTopics } from "@/data/topics";
import { LogoutButton } from "@/components/LogoutButton";
import { MasteryChip } from "@/components/MasteryChip";

export const dynamic = "force-dynamic";

// Student home: each topic with a progress bar and the student's status on every objective.
export default async function StudentHome() {
  const user = await requireUser("STUDENT");

  const objectives = await db.objective.findMany({
    where: { subtopicId: { in: builtTopics.map((t) => t.key) } },
    orderBy: { sortOrder: "asc" },
  });
  // Only this student's own rows: students never see anyone else's data.
  const masteryRows = await db.mastery.findMany({ where: { studentId: user.userId } });
  const masteryByObjective = new Map(masteryRows.map((row) => [row.objectiveId, row]));

  return (
    <main className="mx-auto max-w-2xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hi, {user.name.split(" ")[0]}</h1>
        <LogoutButton />
      </div>

      <h2 className="mt-6 font-semibold">My topics</h2>
      <div className="mt-2 space-y-4">
        {builtTopics.map((topic) => {
          const topicObjectives = objectives.filter((o) => o.subtopicId === topic.key);
          const masteredCount = topicObjectives.filter(
            (o) => masteryByObjective.get(o.id)?.status === "MASTERED",
          ).length;
          const progress = Math.round((masteredCount / topicObjectives.length) * 100);

          return (
            <section key={topic.key} className="rounded-lg border bg-white p-3">
              <Link href={`/student/topic/${topic.key}`} className="flex items-center justify-between">
                <span>
                  <span className="block text-sm text-gray-500">{topic.topic}</span>
                  <span className="font-medium">
                    {topic.key} {topic.title}
                  </span>
                </span>
                <span className="rounded bg-blue-700 px-3 py-1 text-sm text-white">Open</span>
              </Link>

              {/* Progress bar: share of objectives mastered */}
              <div className="mt-3 h-2 rounded bg-gray-200">
                <div className="h-2 rounded bg-green-600" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-600">
                {masteredCount} of {topicObjectives.length} objectives mastered
              </p>

              <ul className="mt-3 space-y-2">
                {topicObjectives.map((objective) => {
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
          );
        })}
      </div>

      <Link href="/syllabus" className="mt-6 inline-block text-blue-700 underline">
        Browse the full syllabus
      </Link>
    </main>
  );
}
