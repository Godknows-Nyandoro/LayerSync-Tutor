import Link from "next/link";
import { ArrowRight, Binary, ChevronDown, ChevronRight, CircuitBoard, CirclePlay, Layers, MessageCircle, Star } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { findUnit, mainUnits, units, type Unit } from "@/data/topics";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { buttonPrimary, card, pageContainer } from "@/components/ui/styles";

export const dynamic = "force-dynamic";

// An icon for each main topic, so the two big cards are easy to tell apart.
const MAIN_ICONS: Record<string, typeof Binary> = { "1.1": Binary, "10": CircuitBoard };

type Progress = { mastered: number; total: number; percent: number };

// Student home: continue card, the two main topics, then every other topic folded away.
export default async function StudentHome() {
  const user = await requireUser("STUDENT");

  const [objectives, masteryRows, lastAttempt, lastChat] = await Promise.all([
    db.objective.findMany({ select: { id: true, subtopicId: true } }),
    // Only this student's own rows: students never see anyone else's data.
    db.mastery.findMany({ where: { studentId: user.userId }, select: { objectiveId: true, status: true } }),
    db.attempt.findFirst({
      where: { studentId: user.userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, question: { select: { objective: { select: { subtopicId: true } } } } },
    }),
    db.tutorSession.findFirst({
      where: { studentId: user.userId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true, topicKey: true },
    }),
  ]);

  // How many objectives in each unit this student has mastered.
  const masteredIds = new Set(masteryRows.filter((m) => m.status === "MASTERED").map((m) => m.objectiveId));
  function progressFor(unitKey: string): Progress {
    const unitObjectives = objectives.filter((o) => o.subtopicId === unitKey);
    const mastered = unitObjectives.filter((o) => masteredIds.has(o.id)).length;
    const total = unitObjectives.length;
    return { mastered, total, percent: total ? Math.round((mastered / total) * 100) : 0 };
  }

  // "Continue where you left off": the unit of the most recent check or tutor chat.
  const lastCheckTime = lastAttempt?.createdAt.getTime() ?? 0;
  const lastChatTime = lastChat?.updatedAt.getTime() ?? 0;
  const lastUnitKey =
    lastCheckTime === 0 && lastChatTime === 0
      ? null
      : lastCheckTime >= lastChatTime
        ? lastAttempt!.question.objective.subtopicId
        : lastChat!.topicKey;
  const continueUnit = (lastUnitKey && findUnit(lastUnitKey)) || mainUnits[0];

  // The other units, grouped under their syllabus topic (e.g. "2 Data transmission").
  const otherUnits = units.filter((unit) => !unit.isMain);
  const topicNames = [...new Set(otherUnits.map((unit) => unit.topic))];

  return (
    <main className={`${pageContainer} space-y-8`}>
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Hi, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-slate-600">Pick a topic, learn it, practise with the tutor, then check yourself.</p>
      </div>

      {/* Quick starts: continue studying, or just chat with the tutor */}
      <div className="grid gap-3 sm:grid-cols-[3fr_2fr]">
        <Link
          href={`/student/topic/${continueUnit.key}`}
          className="flex min-w-0 items-center gap-4 rounded-2xl bg-orange-700 p-4 text-white shadow-sm transition-colors hover:bg-orange-800 sm:p-5"
        >
          <CirclePlay className="h-10 w-10 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-orange-100">{lastUnitKey ? "Continue where you left off" : "Start here"}</span>
            <span className="block truncate text-lg font-semibold">
              {continueUnit.key} {continueUnit.title}
            </span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
        </Link>
        <Link
          href="/student/tutor"
          className="flex min-w-0 items-center gap-4 rounded-2xl border-2 border-orange-200 bg-white p-4 shadow-sm transition-colors hover:border-orange-400 sm:p-5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700">
            <MessageCircle className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-semibold">Chat with the tutor</span>
            <span className="block truncate text-sm text-slate-600">Ask about any topic</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
        </Link>
      </div>

      {/* The two main topics */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Star className="h-5 w-5 text-orange-600" aria-hidden />
          Main topics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {mainUnits.map((unit) => (
            <MainTopicCard key={unit.key} unit={unit} progress={progressFor(unit.key)} />
          ))}
        </div>
      </section>

      {/* Every other topic, folded away. name="topics" means only one can be open at a time. */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Layers className="h-5 w-5 text-orange-600" aria-hidden />
          All topics
        </h2>
        <div className="space-y-2">
          {topicNames.map((topicName) => {
            const topicUnits = otherUnits.filter((unit) => unit.topic === topicName);

            // A topic with only one part (e.g. 7 or 9) links straight to it: no need to open a list.
            if (topicUnits.length === 1) {
              return (
                <ul key={topicName} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <UnitRow unit={topicUnits[0]} progress={progressFor(topicUnits[0].key)} />
                </ul>
              );
            }

            return (
              <details key={topicName} name="topics" className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                  <span>
                    <span className="block font-medium">{topicName}</span>
                    <span className="text-sm text-slate-500">
                      {topicUnits.length} {topicUnits.length === 1 ? "part" : "parts"}
                    </span>
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <ul className="divide-y divide-slate-100 border-t border-slate-100">
                  {topicUnits.map((unit) => (
                    <UnitRow key={unit.key} unit={unit} progress={progressFor(unit.key)} />
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

function MainTopicCard({ unit, progress }: { unit: Unit; progress: Progress }) {
  const Icon = MAIN_ICONS[unit.key] ?? Binary;
  return (
    <div className={`${card} flex flex-col gap-4 border-orange-200`}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{unit.topic}</p>
          <h3 className="text-lg font-semibold">
            {unit.key} {unit.title}
          </h3>
        </div>
      </div>
      <div>
        <ProgressBar percent={progress.percent} />
        <p className="mt-1.5 text-sm text-slate-600">
          {progress.mastered} of {progress.total} objectives mastered
        </p>
      </div>
      <Link href={`/student/topic/${unit.key}`} className={`${buttonPrimary} mt-auto`}>
        Study this topic
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

function UnitRow({ unit, progress }: { unit: Unit; progress: Progress }) {
  return (
    <li>
      <Link href={`/student/topic/${unit.key}`} className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-slate-50">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">
            {unit.key} {unit.title}
          </span>
          <span className="mt-1.5 flex items-center gap-2">
            <span className="w-24 sm:w-32">
              <ProgressBar percent={progress.percent} />
            </span>
            <span className="text-xs text-slate-500">
              {progress.mastered}/{progress.total} mastered
            </span>
          </span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
      </Link>
    </li>
  );
}
