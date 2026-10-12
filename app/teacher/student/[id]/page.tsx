import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronDown, CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { daysSince } from "@/lib/dashboard";
import { findUnit, mainUnits } from "@/data/topics";
import { MasteryChip } from "@/components/MasteryChip";
import { lastLoginText } from "@/components/ScoreBadge";
import { card, wideContainer } from "@/components/ui/styles";

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

  // Show every main-topic objective, plus any other objective this student has attempted.
  const objectives = await db.objective.findMany({
    where: {
      OR: [
        { subtopicId: { in: mainUnits.map((t) => t.key) } },
        { id: { in: student.mastery.map((m) => m.objectiveId) } },
      ],
    },
    orderBy: { sortOrder: "asc" },
  });
  const masteryByObjective = new Map(student.mastery.map((m) => [m.objectiveId, m]));
  const unitKeys = [...new Set(objectives.map((o) => o.subtopicId))];
  const days = daysSince(student.lastLoginAt);
  const masteredCount = student.mastery.filter((m) => m.status === "MASTERED").length;
  const initials = student.name.split(" ").map((part) => part[0]).join("");

  const stats = [
    { label: "Last login", value: lastLoginText(days), warn: days === null || days >= 7 },
    { label: "Objectives mastered", value: String(masteredCount), warn: false },
    { label: "Tutor chats", value: String(student._count.tutorSessions), warn: false },
  ];

  return (
    <main className={`${wideContainer} space-y-5`}>
      <Link href="/teacher?tab=class" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Class
      </Link>

      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-800">
          {initials}
        </span>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{student.name}</h1>
          <p className="text-slate-600">
            {student.studentCode} · Class {student.className}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className={`${card} text-center`}>
            <p className={`text-base font-bold sm:text-2xl ${stat.warn ? "text-red-700" : ""}`}>{stat.value}</p>
            <p className="text-xs text-slate-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <section className={`${card} min-w-0`}>
          <h2 className="font-semibold">Mastery</h2>
          <div className="mt-3 space-y-4">
            {unitKeys.map((unitKey) => {
              const unit = findUnit(unitKey);
              return (
                <div key={unitKey}>
                  <h3 className="mb-2 text-sm font-semibold text-orange-700">
                    {unit?.key} {unit?.title}
                  </h3>
                  <ul className="space-y-2">
                    {objectives
                      .filter((o) => o.subtopicId === unitKey)
                      .map((objective) => {
                        const row = masteryByObjective.get(objective.id);
                        return (
                          // On phones the chip sits under the text; on wider screens it sits on the right.
                          <li key={objective.id} className="flex flex-col items-start gap-1.5 text-sm sm:flex-row sm:justify-between sm:gap-3">
                            <span className="text-slate-700">
                              <span className="mr-1 font-mono text-xs font-semibold text-slate-500">{objective.id}</span>
                              {objective.statement}
                            </span>
                            <MasteryChip status={row?.status ?? "NOT_STARTED"} percent={row?.percent} />
                          </li>
                        );
                      })}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section className={`${card} min-w-0`}>
          <h2 className="font-semibold">Latest answers</h2>
          <div className="mt-3 space-y-2">
            {student.attempts.map((attempt) => {
              const full = attempt.score === attempt.maxScore;
              const Icon = full ? CircleCheck : attempt.score > 0 ? CircleAlert : CircleX;
              const color = full ? "text-green-600" : attempt.score > 0 ? "text-amber-500" : "text-red-500";
              return (
                <details key={attempt.id} className="group rounded-xl border border-slate-200">
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
                    <Icon className={`h-5 w-5 shrink-0 ${color}`} aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-sm">{attempt.question.prompt}</span>
                    <span className="shrink-0 text-sm font-semibold">
                      {attempt.score}/{attempt.maxScore}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <div className="space-y-2 border-t border-slate-100 p-3 text-sm">
                    <p className="text-slate-700">{attempt.question.prompt}</p>
                    <p>
                      <span className="font-medium">Answer: </span>
                      <span className="whitespace-pre-wrap text-slate-700">{attempt.answer || "(blank)"}</span>
                    </p>
                    <p className="rounded-lg bg-slate-50 p-2 text-slate-700">{attempt.feedback}</p>
                    <p className="text-xs text-slate-400">{attempt.createdAt.toLocaleDateString("en-GB")}</p>
                  </div>
                </details>
              );
            })}
            {student.attempts.length === 0 && <p className="text-sm text-slate-600">No checks taken yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
