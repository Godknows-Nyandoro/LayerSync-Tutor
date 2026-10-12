import Link from "next/link";
import {
  ArrowRight,
  Binary,
  ChevronDown,
  ChevronRight,
  CircuitBoard,
  ClipboardCheck,
  Layers,
  MessageCircle,
  Star,
  Target,
} from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { findUnit, mainUnits, units, type Unit } from "@/data/topics";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { buttonPrimary, buttonSecondary, card } from "@/components/ui/styles";

export const dynamic = "force-dynamic";

// An icon for each main topic, so the two big cards are easy to tell apart.
const MAIN_ICONS: Record<string, typeof Binary> = { "1.1": Binary, "10": CircuitBoard };

type Progress = { mastered: number; total: number; percent: number };

// Student home: a welcome banner with progress and quick actions, the two main topics,
// then every other topic folded away.
export default async function StudentHome() {
  const user = await requireUser("STUDENT");

  const [student, objectives, masteryRows, lastAttempt, lastChat, answerCount, chatCount] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: user.userId }, select: { className: true } }),
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
    db.attempt.count({ where: { studentId: user.userId } }),
    db.tutorSession.count({ where: { studentId: user.userId } }),
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

  const stats = [
    { label: "Objectives mastered", value: `${masteredIds.size} / ${objectives.length}`, icon: Target },
    { label: "Questions answered", value: String(answerCount), icon: ClipboardCheck },
    { label: "Tutor chats", value: String(chatCount), icon: MessageCircle },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl space-y-10 px-4 py-6 sm:py-8">
      {/* ---------- Welcome banner ---------- */}
      {/* A white card like the rest of the page, with a soft orange tint on the left. */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-orange-50 via-white to-white p-5 sm:p-8">
          <p className="text-sm font-semibold text-orange-700">
            IGCSE Computer Science 0478 · Class {student.className}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="mt-2 max-w-xl text-slate-600">
            Learn a topic, practise with the tutor, then take a check to see what you have mastered.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={`/student/topic/${continueUnit.key}`} className={`${buttonPrimary} min-w-0 px-5 py-3 text-base`}>
              <span className="truncate">
                {lastUnitKey ? "Continue" : "Start"}: {continueUnit.key} {continueUnit.title}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
            <Link href="/student/tutor?back=/student" className={`${buttonSecondary} px-5 py-3 text-base`}>
              <MessageCircle className="h-4 w-4 text-orange-700" aria-hidden />
              Chat with the tutor
            </Link>
          </div>
        </div>

        {/* Progress numbers along the bottom of the card */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 px-2 py-4 text-center sm:flex-row sm:justify-center sm:gap-3 sm:px-6">
              <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 sm:flex">
                <stat.icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="sm:text-left">
                <p className="text-lg font-bold text-slate-900 sm:text-xl">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- The two main topics ---------- */}
      <section>
        <SectionHeading icon={Star} title="Main topics" text="The two topics your class is focusing on this term." />
        <div className="grid gap-4 sm:grid-cols-2">
          {mainUnits.map((unit) => (
            <MainTopicCard key={unit.key} unit={unit} progress={progressFor(unit.key)} />
          ))}
        </div>
      </section>

      {/* ---------- Every other topic, folded away. name="topics" means only one can be open at a time. ---------- */}
      <section>
        <SectionHeading icon={Layers} title="All topics" text="Every other part of the syllabus, with a guide, the tutor and a check." />
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
                <summary className="flex list-none items-center justify-between gap-3 p-4 hover:bg-slate-50">
                  <span>
                    <span className="block font-medium">{topicName}</span>
                    <span className="text-sm text-slate-500">{topicUnits.length} parts</span>
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

function SectionHeading({ icon: Icon, title, text }: { icon: typeof Star; title: string; text: string }) {
  return (
    <div className="mb-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
        <Icon className="h-5 w-5 text-orange-600" aria-hidden />
        {title}
      </h2>
      <p className="mt-0.5 text-sm text-slate-600">{text}</p>
    </div>
  );
}

function MainTopicCard({ unit, progress }: { unit: Unit; progress: Progress }) {
  const Icon = MAIN_ICONS[unit.key] ?? Binary;
  return (
    <div className={`${card} flex flex-col gap-5 transition-shadow hover:shadow-md`}>
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
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
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-slate-600">Progress</span>
          <span className="font-semibold">{progress.percent}%</span>
        </div>
        <ProgressBar percent={progress.percent} />
        <p className="mt-1.5 text-sm text-slate-500">
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
