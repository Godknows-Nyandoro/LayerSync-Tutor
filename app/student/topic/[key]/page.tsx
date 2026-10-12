import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { findUnit } from "@/data/topics";
import type { GuideSection } from "@/data/guides";
import { StudyTabs, type TabKey } from "@/components/study/StudyTabs";
import { GuideStepper } from "@/components/study/GuideStepper";
import { TutorChat } from "@/components/TutorChat";
import { CheckQuiz } from "@/components/CheckQuiz";
import { MasteryChip } from "@/components/MasteryChip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { card, pageContainer } from "@/components/ui/styles";

export const dynamic = "force-dynamic";

const TAB_KEYS: TabKey[] = ["learn", "tutor", "check", "progress"];

// One unit for a student, split into tabs: Learn (guide), Ask tutor, Check, Progress.
// The URL is /student/topic/<unit key>?tab=<tab>, e.g. /student/topic/1.1?tab=check
export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser("STUDENT");
  const { key } = await params;
  const { tab } = await searchParams;
  const topic = findUnit(key);
  if (!topic) notFound();
  const initialTab = TAB_KEYS.includes(tab as TabKey) ? (tab as TabKey) : "learn";

  const [guide, questions, objectives, masteryRows] = await Promise.all([
    // status: "APPROVED" means a draft guide is never sent to a student.
    db.guide.findFirst({ where: { topicKey: topic.key, status: "APPROVED" } }),
    // `select` picks only safe fields: the answer and mark scheme never reach the browser.
    db.question.findMany({
      where: { objective: { subtopicId: topic.key } },
      select: { id: true, objectiveId: true, type: true, prompt: true, options: true, marks: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.objective.findMany({ where: { subtopicId: topic.key }, orderBy: { sortOrder: "asc" } }),
    db.mastery.findMany({ where: { studentId: user.userId, objective: { subtopicId: topic.key } } }),
  ]);

  const masteryByObjective = new Map(masteryRows.map((m) => [m.objectiveId, m]));
  const masteredCount = masteryRows.filter((m) => m.status === "MASTERED").length;
  const percent = objectives.length ? Math.round((masteredCount / objectives.length) * 100) : 0;

  return (
    <main className={`${pageContainer} space-y-5`}>
      <Link href="/student" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        My topics
      </Link>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{topic.topic}</p>
        <h1 className="text-2xl font-bold sm:text-3xl">
          {topic.key} {topic.title}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <div className="w-40 sm:w-56">
            <ProgressBar percent={percent} />
          </div>
          <span className="text-sm text-slate-600">
            {masteredCount} of {objectives.length} mastered
          </span>
        </div>
      </div>

      <StudyTabs
        initialTab={initialTab}
        panels={[
          {
            key: "learn",
            label: "Learn",
            content: guide ? (
              <GuideStepper sections={guide.sections as GuideSection[]} />
            ) : (
              <div className={`${card} py-10 text-center`}>
                <BookOpen className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
                <p className="mt-3 font-medium">The guide for this topic is not ready yet</p>
                <p className="mt-1 text-sm text-slate-600">
                  Your teacher has not released it. You can still ask the tutor and take the check.
                </p>
              </div>
            ),
          },
          { key: "tutor", label: "Ask tutor", content: <TutorChat topicKey={topic.key} topicTitle={topic.title} /> },
          { key: "check", label: "Check", content: <CheckQuiz topicKey={topic.key} questions={questions} /> },
          {
            key: "progress",
            label: "Progress",
            content: (
              <ul className="space-y-2">
                {objectives.map((objective) => {
                  const row = masteryByObjective.get(objective.id);
                  return (
                    <li key={objective.id} className={`${card} flex flex-col items-start gap-2 sm:flex-row sm:justify-between`}>
                      <p className="text-sm">
                        <span className="mr-1 font-mono text-xs font-semibold text-slate-500">{objective.id}</span>
                        {objective.statement}
                      </p>
                      <MasteryChip status={row?.status ?? "NOT_STARTED"} percent={row?.percent} />
                    </li>
                  );
                })}
              </ul>
            ),
          },
        ]}
      />
    </main>
  );
}
