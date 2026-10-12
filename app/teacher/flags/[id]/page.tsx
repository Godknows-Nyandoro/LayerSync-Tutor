import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { FLAG_REASON_LABEL } from "@/lib/dashboard";
import { findUnit } from "@/data/topics";
import { SubmitButton } from "@/components/SubmitButton";
import { resolveFlag } from "../actions";

export const dynamic = "force-dynamic";

type StoredMessage = { role: "user" | "assistant"; content: string };

// Teacher: the whole tutor conversation, with the flagged reply highlighted.
export default async function FlagDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser("TEACHER");
  const teacher = await db.user.findUniqueOrThrow({ where: { id: session.userId } });
  const { id } = await params;

  // Only flags from students in this teacher's class.
  const flag = await db.tutorFlag.findFirst({
    where: { id, student: { className: teacher.className } },
    include: { student: true, session: true },
  });
  if (!flag) notFound();

  const messages = flag.session.messages as StoredMessage[];
  const unit = findUnit(flag.session.topicKey);
  const isOpen = flag.status === "OPEN";

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href="/teacher" className="text-sm text-blue-700">
        ← Class dashboard
      </Link>
      <h1 className="text-2xl font-bold">Flagged tutor reply</h1>

      <section className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
        <p>
          <strong>{flag.student.name}</strong> flagged a reply in{" "}
          <strong>
            {unit?.key} {unit?.title}
          </strong>{" "}
          on {flag.createdAt.toLocaleDateString("en-GB")}.
        </p>
        <p className="mt-1">
          Reason: <strong>{FLAG_REASON_LABEL[flag.reason]}</strong>
        </p>
        {flag.comment && <p className="mt-1">Comment: &ldquo;{flag.comment}&rdquo;</p>}
        <div className="mt-3">
          {isOpen ? (
            <form action={resolveFlag.bind(null, flag.id)}>
              <SubmitButton
                label="Mark as resolved"
                pendingLabel="Saving..."
                className="rounded bg-green-700 px-3 py-1 text-white"
              />
            </form>
          ) : (
            <p className="text-green-800">Resolved on {flag.resolvedAt?.toLocaleDateString("en-GB")}.</p>
          )}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-3">
        <h2 className="font-semibold">The conversation</h2>
        <div className="mt-3 space-y-2">
          {messages.map((message, index) => {
            const isFlagged = index === flag.messageIndex;
            return (
              <div key={index}>
                {isFlagged && <p className="text-xs font-semibold text-red-700">🚩 Flagged reply</p>}
                <p
                  className={`whitespace-pre-wrap rounded p-2 text-sm ${
                    message.role === "user" ? "ml-8 bg-blue-50" : "mr-8 bg-gray-100"
                  } ${isFlagged ? "border-2 border-red-500" : ""}`}
                >
                  <span className="block text-xs text-gray-500">
                    {message.role === "user" ? flag.student.name : "Tutor"}
                  </span>
                  {message.content}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
