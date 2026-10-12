import { ChevronDown, Library } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { AppHeader } from "@/components/AppHeader";
import { pageContainer } from "@/components/ui/styles";

export const dynamic = "force-dynamic";

// Browse the syllabus: topic -> sub-topic -> objective. Open to students and teachers.
// Uses <details> so topics open and close with no JavaScript (light on mobile data).
export default async function SyllabusPage() {
  const user = await requireUser();
  const objectives = await db.objective.findMany({ orderBy: { sortOrder: "asc" } });

  // Group objectives by topic, then by sub-topic, keeping syllabus order.
  const topics = new Map<string, { paper: number; subtopics: Map<string, typeof objectives> }>();
  for (const objective of objectives) {
    const topicKey = `${objective.topicNumber} ${objective.topic}`;
    const subtopicKey = objective.subtopicId.includes(".")
      ? `${objective.subtopicId} ${objective.subtopic}`
      : ""; // topics 7, 9 and 10 have no sub-topics

    if (!topics.has(topicKey)) topics.set(topicKey, { paper: objective.paper, subtopics: new Map() });
    const subtopics = topics.get(topicKey)!.subtopics;
    if (!subtopics.has(subtopicKey)) subtopics.set(subtopicKey, []);
    subtopics.get(subtopicKey)!.push(objective);
  }

  return (
    <>
      <AppHeader name={user.name} role={user.role} />
      <main className={pageContainer}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <Library className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-bold">Syllabus 0478</h1>
            <p className="text-sm text-slate-600">
              Cambridge IGCSE Computer Science · {objectives.length} learning objectives
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {[...topics].map(([topicTitle, topic]) => (
            <details key={topicTitle} className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                <span>
                  <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Paper {topic.paper}
                  </span>
                  <span className="font-semibold">{topicTitle}</span>
                </span>
                {/* group-open: the arrow turns when the topic is open */}
                <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
              </summary>

              <div className="space-y-4 border-t border-slate-100 p-4">
                {[...topic.subtopics].map(([subtopicTitle, items]) => (
                  <div key={subtopicTitle}>
                    {subtopicTitle && <h2 className="mb-2 text-sm font-semibold text-indigo-700">{subtopicTitle}</h2>}
                    <ul className="space-y-2">
                      {items.map((objective) => (
                        <li key={objective.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                          <span className="mr-1 font-mono text-xs font-semibold text-slate-500">{objective.id}</span>
                          {objective.statement}
                          {objective.notes.length > 0 && (
                            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-slate-600">
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
              </div>
            </details>
          ))}
        </div>
      </main>
    </>
  );
}
