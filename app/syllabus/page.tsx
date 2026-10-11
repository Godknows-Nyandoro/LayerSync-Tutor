import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Browse the syllabus: topic -> sub-topic -> objective.
// Uses <details> so sections open and close with no JavaScript (light on mobile data).
export default async function SyllabusPage() {
  const objectives = await db.objective.findMany({ orderBy: { sortOrder: "asc" } });

  // Group objectives by topic, then by sub-topic, keeping syllabus order.
  const topics = new Map<string, Map<string, typeof objectives>>();
  for (const objective of objectives) {
    const topicKey = `${objective.topicNumber} ${objective.topic}`;
    const subtopicKey = objective.subtopicId.includes(".")
      ? `${objective.subtopicId} ${objective.subtopic}`
      : ""; // topics 7, 9 and 10 have no sub-topics

    if (!topics.has(topicKey)) topics.set(topicKey, new Map());
    const subtopics = topics.get(topicKey)!;
    if (!subtopics.has(subtopicKey)) subtopics.set(subtopicKey, []);
    subtopics.get(subtopicKey)!.push(objective);
  }

  return (
    <main className="mx-auto max-w-2xl p-4">
      <Link href="/" className="text-sm text-blue-700">
        ← Back
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Syllabus 0478</h1>
      <p className="text-sm text-gray-600">{objectives.length} learning objectives</p>

      <div className="mt-4 space-y-3">
        {[...topics].map(([topicTitle, subtopics]) => (
          <details key={topicTitle} className="rounded-lg border bg-white p-3">
            <summary className="cursor-pointer font-semibold">{topicTitle}</summary>

            {[...subtopics].map(([subtopicTitle, items]) => (
              <div key={subtopicTitle} className="mt-3">
                {subtopicTitle && <h2 className="font-medium text-gray-800">{subtopicTitle}</h2>}
                <ul className="mt-1 space-y-2">
                  {items.map((objective) => (
                    <li key={objective.id} className="rounded bg-gray-50 p-2 text-sm">
                      <span className="font-mono font-semibold">{objective.id}</span>{" "}
                      {objective.statement}
                      {objective.notes.length > 0 && (
                        <ul className="mt-1 list-disc pl-5 text-gray-600">
                          {objective.notes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </details>
        ))}
      </div>
    </main>
  );
}
