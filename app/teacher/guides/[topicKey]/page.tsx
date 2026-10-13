import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleCheck, EyeOff, FileText, PenLine, Sparkles, TriangleAlert } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { findUnit } from "@/data/topics";
import type { GuideSection } from "@/data/guides";
import { GuideView } from "@/components/GuideView";
import { SubmitButton } from "@/components/SubmitButton";
import { buttonPrimary, buttonSecondary, buttonSuccess, card, pageContainer } from "@/components/ui/styles";
import { approveGuide, generateDraft, unpublishGuide } from "../actions";

export const dynamic = "force-dynamic";

// Vercel stops a server function after a time limit. The "Generate a draft with AI" button
// runs on this page and can take about 20 seconds, so allow up to 60.
export const maxDuration = 60;

// Teacher: preview a unit's guide exactly as students will see it, then approve or replace it.
// If the unit has no guide yet, offer to generate one.
export default async function GuidePreview({
  params,
  searchParams,
}: {
  params: Promise<{ topicKey: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireUser("TEACHER");
  const { topicKey } = await params;
  const { error } = await searchParams;
  const unit = findUnit(topicKey);
  if (!unit) notFound();

  const guide = await db.guide.findUnique({ where: { topicKey: unit.key } });
  const isLive = guide?.status === "APPROVED";

  const status = !guide
    ? { label: "No guide yet", icon: FileText, box: "border-slate-200 bg-white", text: "text-slate-700" }
    : isLive
      ? { label: "Live for students", icon: CircleCheck, box: "border-green-200 bg-green-50", text: "text-green-800" }
      : { label: "Draft: students cannot see this yet", icon: PenLine, box: "border-amber-200 bg-amber-50", text: "text-amber-800" };
  const StatusIcon = status.icon;

  return (
    <main className={`${pageContainer} space-y-5`}>
      <Link href="/teacher/guides" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All guides
      </Link>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{unit.topic}</p>
        <h1 className="text-2xl font-bold sm:text-3xl">
          {unit.key} {unit.title}
        </h1>
      </div>

      {/* Status and actions */}
      <section className={`rounded-2xl border p-4 sm:p-5 ${status.box}`}>
        <p className={`flex items-center gap-2 font-semibold ${status.text}`}>
          <StatusIcon className="h-5 w-5" aria-hidden />
          {status.label}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {/* .bind(null, unit.key) gives the action its topicKey argument when the form is submitted */}
          {guide && !isLive && (
            <form action={approveGuide.bind(null, unit.key)}>
              <SubmitButton label="Approve and release to students" pendingLabel="Saving..." className={`${buttonSuccess} w-full`} />
            </form>
          )}
          {guide && isLive && (
            <form action={unpublishGuide.bind(null, unit.key)}>
              <SubmitButton label="Unpublish (hide from students)" pendingLabel="Saving..." className={`${buttonSecondary} w-full`} />
            </form>
          )}
          <form action={generateDraft.bind(null, unit.key)}>
            <SubmitButton
              label={guide ? "Generate a new draft with AI" : "Generate a draft with AI"}
              pendingLabel="Writing draft (about 20 seconds)..."
              className={`${guide ? buttonSecondary : buttonPrimary} w-full`}
            />
          </form>
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-600">
          {guide ? <EyeOff className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> : <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />}
          {guide
            ? "A new AI draft replaces this guide and hides it from students until you approve it."
            : "The draft is written from this topic's syllabus objectives. You review it before students see it."}
        </p>
        {error && (
          <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
            The AI could not write a usable draft. Please try again.
          </p>
        )}
      </section>

      {guide ? (
        <>
          <h2 className="text-lg font-semibold">Preview ({(guide.sections as GuideSection[]).length} sections)</h2>
          <GuideView sections={guide.sections as GuideSection[]} />
        </>
      ) : (
        <div className={`${card} py-10 text-center text-slate-500`}>
          <FileText className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
          <p className="mt-2">No guide yet. Generate a draft to see a preview here.</p>
        </div>
      )}
    </main>
  );
}
