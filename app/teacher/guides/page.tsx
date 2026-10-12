import Link from "next/link";
import { ChevronDown, ChevronRight, CircleCheck, FileText, PenLine, Star } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { mainUnits, units, type Unit } from "@/data/topics";
import { card, pageContainer } from "@/components/ui/styles";

export const dynamic = "force-dynamic";

const STATUS = {
  APPROVED: { label: "Live", icon: CircleCheck, className: "bg-green-100 text-green-800" },
  DRAFT: { label: "Draft", icon: PenLine, className: "bg-amber-100 text-amber-800" },
  NONE: { label: "No guide", icon: FileText, className: "bg-slate-100 text-slate-600" },
};
type StatusKey = keyof typeof STATUS;

// Teacher: every unit in the syllabus and the state of its guide.
export default async function GuidesList() {
  await requireUser("TEACHER");
  const guides = await db.guide.findMany({ select: { topicKey: true, status: true } });
  const statusByUnit = new Map<string, StatusKey>(guides.map((g) => [g.topicKey, g.status]));
  const statusOf = (unit: Unit) => statusByUnit.get(unit.key) ?? "NONE";

  const liveCount = guides.filter((g) => g.status === "APPROVED").length;
  const draftCount = guides.filter((g) => g.status === "DRAFT").length;

  // The other units, grouped under their syllabus topic.
  const otherUnits = units.filter((unit) => !unit.isMain);
  const topicNames = [...new Set(otherUnits.map((unit) => unit.topic))];

  return (
    <main className={`${pageContainer} space-y-6`}>
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Guides</h1>
        <p className="mt-1 text-slate-600">
          Generate a draft with AI for any topic. Students only see a guide after you approve it.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {liveCount} live · {draftCount} waiting for review · {units.length - liveCount - draftCount} without a guide
        </p>
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Star className="h-5 w-5 text-orange-600" aria-hidden />
          Main topics
        </h2>
        <ul className={`${card} divide-y divide-slate-100 p-0 sm:p-0`}>
          {mainUnits.map((unit) => (
            <GuideRow key={unit.key} unit={unit} status={statusOf(unit)} />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">All topics</h2>
        <div className="space-y-2">
          {topicNames.map((topicName) => {
            const topicUnits = otherUnits.filter((unit) => unit.topic === topicName);
            const live = topicUnits.filter((unit) => statusOf(unit) === "APPROVED").length;
            return (
              <details key={topicName} name="guide-topics" className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                  <span>
                    <span className="block font-medium">{topicName}</span>
                    <span className="text-sm text-slate-500">
                      {live} of {topicUnits.length} live
                    </span>
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <ul className="divide-y divide-slate-100 border-t border-slate-100">
                  {topicUnits.map((unit) => (
                    <GuideRow key={unit.key} unit={unit} status={statusOf(unit)} />
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function GuideRow({ unit, status }: { unit: Unit; status: StatusKey }) {
  const style = STATUS[status];
  const Icon = style.icon;
  return (
    <li>
      <Link href={`/teacher/guides/${unit.key}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
        <span className="min-w-0 flex-1 text-sm font-medium">
          <span className="mr-1 font-mono text-xs text-slate-500">{unit.key}</span>
          {unit.title}
        </span>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {style.label}
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
      </Link>
    </li>
  );
}
