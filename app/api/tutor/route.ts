// POST /api/tutor
// Body: { topicKey, sessionId?, message }
// Streams back the tutor's reply as plain text. The chat id is sent in the X-Session-Id header.

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { findBuiltTopic } from "@/data/topics";
import type { GuideSection } from "@/data/guides";
import { streamChat, type ChatMessage } from "@/lib/openrouter";
import {
  MAX_MESSAGE_CHARS,
  MAX_REPLY_TOKENS,
  MAX_STUDENT_TURNS,
  buildSystemPrompt,
  countAttempts,
  hintLevelFor,
} from "@/lib/tutor";

type StoredMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  // 1. Only logged-in students can use the tutor.
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return new Response("Please log in as a student.", { status: 401 });
  }

  // 2. Check the input.
  const body = await request.json();
  const topic = findBuiltTopic(String(body.topicKey));
  const message = String(body.message ?? "").trim();
  if (!topic) return new Response("Unknown topic.", { status: 400 });
  if (!message) return new Response("Please type a message.", { status: 400 });
  if (message.length > MAX_MESSAGE_CHARS) {
    return new Response(`Please keep messages under ${MAX_MESSAGE_CHARS} characters.`, { status: 400 });
  }

  // 3. Load this student's chat (or start a new one).
  // The history comes from the database, never from the browser, so it cannot be faked.
  let chat = body.sessionId
    ? await db.tutorSession.findFirst({ where: { id: String(body.sessionId), studentId: session.userId } })
    : null;
  if (!chat) {
    chat = await db.tutorSession.create({
      data: { studentId: session.userId, topicKey: topic.key, messages: [] },
    });
  }
  const history = chat.messages as StoredMessage[];
  const studentMessages = [...history.filter((m) => m.role === "user").map((m) => m.content), message];

  if (studentMessages.length > MAX_STUDENT_TURNS) {
    return new Response("This chat has reached its limit. Start a new chat to keep going.", { status: 429 });
  }

  // 4. Code decides the hint level (the safeguard beyond the prompt).
  const hintLevel = hintLevelFor(countAttempts(studentMessages));

  // 5. Ground the tutor in the syllabus objectives and the approved guide.
  const objectives = await db.objective.findMany({
    where: { subtopicId: topic.key },
    orderBy: { sortOrder: "asc" },
  });
  const guideText = await getApprovedGuideText(topic.key);

  const systemPrompt = buildSystemPrompt({ topicTitle: topic.title, objectives, guideText }, hintLevel);
  const userMessage: StoredMessage = { role: "user", content: message };
  // Send only the last 12 messages, to keep each request small and cheap.
  const messages: ChatMessage[] = [systemPrompt, ...history.slice(-12), userMessage];

  // 6. Stream the reply to the browser as it arrives, then save the chat.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { text, usage } = await streamChat(messages, MAX_REPLY_TOKENS, (piece) =>
          controller.enqueue(encoder.encode(piece)),
        );
        await db.tutorSession.update({
          where: { id: chat.id },
          data: {
            messages: [...history, userMessage, { role: "assistant", content: text }],
            inputTokens: { increment: usage.inputTokens },
            outputTokens: { increment: usage.outputTokens },
          },
        });
      } catch (error) {
        console.error(error);
        controller.enqueue(encoder.encode("\n[Sorry, the tutor is unavailable right now. Please try again.]"));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Session-Id": chat.id },
  });
}
