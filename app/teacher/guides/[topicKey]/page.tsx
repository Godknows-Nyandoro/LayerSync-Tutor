import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import type { GuideSection } from "@/data/guides";
import { GuideView } from "@/components/GuideView";

export const dynamic = "force-dynamic";

// Teacher: preview a guide exactly as students will see it.
export default async function GuidePreview({ params }: { params: Promise<{ topicKey: string }> }) {
  await requireUser("TEACHER");
  const { topicKey } = await params;
  const guide = await db.guide.findUnique({ where: { topicKey } });
  if (!guide) notFound();

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href="/teacher/guides" className="text-sm text-blue-700">
        ← All guides
      </Link>
      <h1 className="text-2xl font-bold">
        {guide.topicKey} {guide.title}
      </h1>
      <p className="text-sm">
        Status:{" "}
        <strong>{guide.status === "APPROVED" ? "Live for students" : "Draft (students cannot see this)"}</strong>
      </p>
      <GuideView sections={guide.sections as GuideSection[]} />
    </main>
  );
}
