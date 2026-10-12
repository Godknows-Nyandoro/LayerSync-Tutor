import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { FLAG_REASON_LABEL } from "@/lib/dashboard";
import { findUnit } from "@/data/topics";
import { ArrowLeft, Bot, CircleCheck, Flag, UserRound } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import { buttonSuccess, card, pageContainer } from "@/components/ui/styles";
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
    <main className={`${pageContainer} space-y-5`}>
      <Link href="/teacher" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Dashboard
      </Link>
      <h1 className="text-2xl font-bold sm:text-3xl">Flagged tutor reply</h1>

      <section className={`rounded-2xl border p-4 sm:p-5 ${isOpen ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"}`}>
        <p>
          <strong>{flag.student.name}</strong> flagged a reply in{" "}
          <strong>
            {unit?.key} {unit?.title}
          </strong>{" "}
          on {flag.createdAt.toLocaleDateString("en-GB")}.
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-medium text-amber-800">
            <Flag className="h-3.5 w-3.5" aria-hidden />
            {FLAG_REASON_LABEL[flag.reason]}
          </span>
          {flag.comment && <span className="text-slate-700">&ldquo;{flag.comment}&rdquo;</span>}
        </p>
        <div className="mt-4">
          {isOpen ? (
            <form action={resolveFlag.bind(null, flag.id)}>
              <SubmitButton label="Mark as resolved" pendingLabel="Saving..." className={buttonSuccess} />
            </form>
          ) : (
            <p className="flex items-center gap-1.5 font-medium text-green-800">
              <CircleCheck className="h-5 w-5" aria-hidden />
              Resolved on {flag.resolvedAt?.toLocaleDateString("en-GB")}
            </p>
          )}
        </div>
      </section>

      <section className={card}>
        <h2 className="font-semibold">The conversation</h2>
        <div className="mt-4 space-y-4">
          {messages.map((message, index) => {
            const isStudent = message.role === "user";
            const isFlagged = index === flag.messageIndex;
            return (
              <div key={index} className={`flex gap-2 ${isStudent ? "flex-row-reverse" : ""}`}>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isStudent ? "bg-slate-200 text-slate-600" : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {isStudent ? <UserRound className="h-4 w-4" aria-hidden /> : <Bot className="h-4 w-4" aria-hidden />}
                </span>
                <div className="max-w-[80%] space-y-1">
                  {isFlagged && (
                    <p className="flex items-center gap-1 text-xs font-semibold text-red-700">
                      <Flag className="h-3.5 w-3.5 fill-red-500" aria-hidden />
                      Flagged reply
                    </p>
                  )}
                  <p
                    className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      isStudent ? "rounded-tr-sm bg-orange-700 text-white" : "rounded-tl-sm bg-slate-100 text-slate-800"
                    } ${isFlagged ? "ring-2 ring-red-500" : ""}`}
                  >
                    {message.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
