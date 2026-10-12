import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import type { GuideSection } from "@/data/guides";
import { GuideView } from "@/components/GuideView";
import { SubmitButton } from "@/components/SubmitButton";
import { approveGuide, generateDraft, unpublishGuide } from "../actions";

export const dynamic = "force-dynamic";

// Teacher: preview a guide exactly as students will see it, then approve or replace it.
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
  const guide = await db.guide.findUnique({ where: { topicKey } });
  if (!guide) notFound();

  const isLive = guide.status === "APPROVED";

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href="/teacher/guides" className="text-sm text-blue-700">
        ← All guides
      </Link>
      <h1 className="text-2xl font-bold">
        {guide.topicKey} {guide.title}
      </h1>

      <section className={`rounded-lg border p-3 ${isLive ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`}>
        <p className="text-sm">
          Status: <strong>{isLive ? "Live for students" : "Draft (students cannot see this)"}</strong>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {/* .bind(null, topicKey) gives the action its topicKey argument when the form is submitted */}
          {isLive ? (
            <form action={unpublishGuide.bind(null, guide.topicKey)}>
              <SubmitButton label="Unpublish" pendingLabel="Saving..." className="rounded border bg-white px-3 py-1 text-sm" />
            </form>
          ) : (
            <form action={approveGuide.bind(null, guide.topicKey)}>
              <SubmitButton
                label="Approve and release to students"
                pendingLabel="Saving..."
                className="rounded bg-green-700 px-3 py-1 text-sm font-medium text-white"
              />
            </form>
          )}
          <form action={generateDraft.bind(null, guide.topicKey)}>
            <SubmitButton
              label="Generate a new draft with AI"
              pendingLabel="Writing draft (about 20 seconds)..."
              className="rounded border bg-white px-3 py-1 text-sm"
            />
          </form>
        </div>
        <p className="mt-2 text-xs text-gray-600">
          A new AI draft replaces this guide and hides it from students until you approve it.
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-700">The AI could not write a usable draft. Please try again.</p>
        )}
      </section>

      <GuideView sections={guide.sections as GuideSection[]} />
    </main>
  );
}
