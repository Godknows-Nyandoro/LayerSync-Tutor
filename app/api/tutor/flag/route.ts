// POST /api/tutor/flag
// Body: { sessionId, messageIndex, reason, comment? }
// A student flags one of the tutor's replies so their teacher can review it.

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const REASONS = ["WRONG", "CONFUSING", "GAVE_ANSWER", "OTHER"] as const;
type Reason = (typeof REASONS)[number];

type StoredMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  // 1. Only logged-in students can flag.
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return Response.json({ error: "Please log in as a student." }, { status: 401 });
  }

  // 2. Check the input.
  const body = await request.json();
  const reason = String(body.reason) as Reason;
  const messageIndex = Number(body.messageIndex);
  const comment = String(body.comment ?? "").trim().slice(0, 500);
  if (!REASONS.includes(reason)) {
    return Response.json({ error: "Please choose a reason." }, { status: 400 });
  }

  // 3. The chat must belong to this student, and the message must be a tutor reply.
  const chat = await db.tutorSession.findFirst({
    where: { id: String(body.sessionId), studentId: session.userId },
  });
  const messages = (chat?.messages ?? []) as StoredMessage[];
  if (!chat || messages[messageIndex]?.role !== "assistant") {
    return Response.json({ error: "That reply could not be found." }, { status: 404 });
  }

  // 4. Save the flag (flagging the same reply again just updates it).
  await db.tutorFlag.upsert({
    where: { sessionId_messageIndex: { sessionId: chat.id, messageIndex } },
    create: { studentId: session.userId, sessionId: chat.id, messageIndex, reason, comment },
    update: { reason, comment, status: "OPEN", resolvedAt: null },
  });

  return Response.json({ ok: true });
}
