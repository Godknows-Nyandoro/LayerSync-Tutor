import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { mainUnits, units, type Unit } from "@/data/topics";
import { MasteryChip, type Status } from "@/components/MasteryChip";

export const dynamic = "force-dynamic";

type ObjectiveRow = { id: string; subtopicId: string; statement: string };
type MasteryRow = { status: Status; percent: number };

// One unit: name, progress bar and (optionally) a chip for every objective.
function UnitCard({
  unit,
  objectives,
  mastery,
  showObjectives,
}: {
  unit: Unit;
  objectives: ObjectiveRow[];
  mastery: Map<string, MasteryRow>;
  showObjectives: boolean;
}) {
  const unitObjectives = objectives.filter((o) => o.subtopicId === unit.key);
  const masteredCount = unitObjectives.filter((o) => mastery.get(o.id)?.status === "MASTERED").length;
  const progress = Math.round((masteredCount / unitObjectives.length) * 100);

  return (
    <section className={`rounded-lg border bg-white p-3 ${unit.isMain ? "border-2 border-blue-700" : ""}`}>
      <Link href={`/student/topic/${unit.key}`} className="flex items-center justify-between gap-2">
        <span>
          {unit.isMain && <span className="text-xs font-semibold uppercase text-blue-700">Main topic · </span>}
          <span className="text-sm text-gray-500">{unit.topic}</span>
          <span className="block font-medium">
            {unit.key} {unit.title}
          </span>
        </span>
        <span className="rounded bg-blue-700 px-3 py-1 text-sm text-white">Open</span>
      </Link>

      {/* Progress bar: share of objectives mastered */}
      <div className="mt-3 h-2 rounded bg-gray-200">
        <div className="h-2 rounded bg-green-600" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-1 text-xs text-gray-600">
        {masteredCount} of {unitObjectives.length} objectives mastered
      </p>

      {showObjectives && (
        <ul className="mt-3 space-y-2">
          {unitObjectives.map((objective) => {
            const row = mastery.get(objective.id);
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
      )}
    </section>
  );
}

// Student home: main topics first (highlighted), then every other unit grouped by syllabus topic.
export default async function StudentHome() {
  const user = await requireUser("STUDENT");

  const objectives = await db.objective.findMany({
    select: { id: true, subtopicId: true, statement: true },
    orderBy: { sortOrder: "asc" },
  });
  // Only this student's own rows: students never see anyone else's data.
  const masteryRows = await db.mastery.findMany({ where: { studentId: user.userId } });
  const mastery = new Map(masteryRows.map((row) => [row.objectiveId, row]));

  // Group the other units under their topic heading, e.g. "2 Data transmission".
  const otherUnits = units.filter((unit) => !unit.isMain);
  const topicNames = [...new Set(otherUnits.map((unit) => unit.topic))];

  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold">Hi, {user.name.split(" ")[0]}</h1>

      <h2 className="mt-6 font-semibold">Main topics</h2>
      <div className="mt-2 space-y-4">
        {mainUnits.map((unit) => (
          <UnitCard key={unit.key} unit={unit} objectives={objectives} mastery={mastery} showObjectives />
        ))}
      </div>

      <h2 className="mt-8 font-semibold">All topics</h2>
      <div className="mt-2 space-y-3">
        {topicNames.map((topicName) => (
          <details key={topicName} className="rounded-lg border bg-gray-50 p-3">
            <summary className="cursor-pointer font-medium">{topicName}</summary>
            <div className="mt-3 space-y-3">
              {otherUnits
                .filter((unit) => unit.topic === topicName)
                .map((unit) => (
                  <UnitCard key={unit.key} unit={unit} objectives={objectives} mastery={mastery} showObjectives />
                ))}
            </div>
          </details>
        ))}
      </div>

      <Link href="/syllabus" className="mt-6 inline-block text-blue-700 underline">
        Browse the full syllabus
      </Link>
    </main>
  );
}
