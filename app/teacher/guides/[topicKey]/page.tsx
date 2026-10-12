import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { findUnit } from "@/data/topics";
import type { GuideSection } from "@/data/guides";
import { GuideView } from "@/components/GuideView";
import { SubmitButton } from "@/components/SubmitButton";
import { approveGuide, generateDraft, unpublishGuide } from "../actions";

export const dynamic = "force-dynamic";

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

  const boxStyle = !guide
    ? "border-gray-300 bg-gray-50"
    : isLive
      ? "border-green-300 bg-green-50"
      : "border-amber-300 bg-amber-50";

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href="/teacher/guides" className="text-sm text-blue-700">
        ← All guides
      </Link>
      <h1 className="text-2xl font-bold">
        {unit.key} {unit.title}
      </h1>

      <section className={`rounded-lg border p-3 ${boxStyle}`}>
        <p className="text-sm">
          Status:{" "}
          <strong>
            {!guide ? "No guide yet" : isLive ? "Live for students" : "Draft (students cannot see this)"}
          </strong>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {/* .bind(null, unit.key) gives the action its topicKey argument when the form is submitted */}
          {guide && isLive && (
            <form action={unpublishGuide.bind(null, unit.key)}>
              <SubmitButton label="Unpublish" pendingLabel="Saving..." className="rounded border bg-white px-3 py-1 text-sm" />
            </form>
          )}
          {guide && !isLive && (
            <form action={approveGuide.bind(null, unit.key)}>
              <SubmitButton
                label="Approve and release to students"
                pendingLabel="Saving..."
                className="rounded bg-green-700 px-3 py-1 text-sm font-medium text-white"
              />
            </form>
          )}
          <form action={generateDraft.bind(null, unit.key)}>
            <SubmitButton
              label={guide ? "Generate a new draft with AI" : "Generate a draft with AI"}
              pendingLabel="Writing draft (about 20 seconds)..."
              className="rounded border bg-white px-3 py-1 text-sm"
            />
          </form>
        </div>
        <p className="mt-2 text-xs text-gray-600">
          {guide
            ? "A new AI draft replaces this guide and hides it from students until you approve it."
            : "The draft is written from this topic's syllabus objectives. You review it before students see it."}
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-700">The AI could not write a usable draft. Please try again.</p>
        )}
      </section>

      {guide && <GuideView sections={guide.sections as GuideSection[]} />}
    </main>
  );
}
