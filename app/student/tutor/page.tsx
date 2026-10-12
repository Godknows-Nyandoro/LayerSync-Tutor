import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { daysSince } from "@/lib/dashboard";
import { findUnit, units } from "@/data/topics";
import { TutorWorkspace, type ChatSummary } from "@/components/tutor/TutorWorkspace";

export const dynamic = "force-dynamic";

type StoredMessage = { role: "user" | "assistant"; content: string };

// "Today", "Yesterday" or a short date like "9 Oct".
function whenLabel(date: Date) {
  const days = daysSince(date);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// The tutor's own page: earlier chats on one side, the open chat on the other.
// /student/tutor              -> chat list (on phones) and a new chat
// /student/tutor?topic=2.3    -> a new chat about topic 2.3
// /student/tutor?chat=<id>    -> open an earlier chat
export default async function TutorPage({ searchParams }: { searchParams: Promise<{ chat?: string; topic?: string }> }) {
  const user = await requireUser("STUDENT");
  const { chat: chatId, topic } = await searchParams;

  // Only this student's chats, newest first.
  const sessions = await db.tutorSession.findMany({
    where: { studentId: user.userId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, topicKey: true, messages: true, updatedAt: true },
  });

  const chats: ChatSummary[] = sessions
    .filter((s) => (s.messages as StoredMessage[]).length > 0)
    .map((s) => {
      const messages = s.messages as StoredMessage[];
      const unit = findUnit(s.topicKey);
      return {
        id: s.id,
        // The chat is named after its topic; the first question is shown underneath.
        title: unit ? `${unit.key} ${unit.title}` : s.topicKey,
        preview: messages.find((m) => m.role === "user")?.content ?? "",
        when: whenLabel(s.updatedAt),
      };
    });

  // An earlier chat to open (it must belong to this student, which the query above ensures).
  const open = sessions.find((s) => s.id === chatId);
  const selected = open
    ? {
        id: open.id,
        topicKey: open.topicKey,
        // Each tutor reply keeps its position in the list, so it can still be flagged.
        messages: (open.messages as StoredMessage[]).map((m, index) =>
          m.role === "assistant" ? { ...m, replyIndex: index } : m,
        ),
      }
    : null;

  const newTopicKey = findUnit(topic ?? "")?.key ?? "1.1";

  return (
    <TutorWorkspace
      chats={chats}
      selected={selected}
      newTopicKey={selected?.topicKey ?? newTopicKey}
      // On phones there is only room for one pane: show the chat if one was chosen, otherwise the list.
      showChatOnPhone={Boolean(open || topic)}
      units={units.map((u) => ({ key: u.key, title: u.title, topic: u.topic }))}
    />
  );
}
