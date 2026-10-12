"use client";
// The tutor page layout.
// Laptop / tablet: the list of earlier chats on the left, the open chat on the right.
// Phone: one pane at a time, the list or the chat, with an "All chats" button to go back.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, MessagesSquare, SquarePen } from "lucide-react";
import { TutorChat } from "@/components/TutorChat";
import { buttonPrimary } from "@/components/ui/styles";

export type ChatSummary = { id: string; title: string; preview: string; when: string };

type Message = { role: "user" | "assistant"; content: string; replyIndex?: number };

type Props = {
  chats: ChatSummary[];
  selected: { id: string; topicKey: string; messages: Message[] } | null;
  newTopicKey: string;
  showChatOnPhone: boolean;
  units: { key: string; title: string; topic: string }[];
};

export function TutorWorkspace({ chats, selected, newTopicKey, showChatOnPhone, units }: Props) {
  const router = useRouter();
  const topicKey = selected?.topicKey ?? newTopicKey;
  const unit = units.find((u) => u.key === topicKey);
  const topicNames = [...new Set(units.map((u) => u.topic))];

  function startNewChat(key: string) {
    router.push(`/student/tutor?topic=${key}`);
  }

  // After each reply is saved: a brand-new chat moves to its own address (so it appears
  // in the list and survives a refresh); an existing chat just refreshes the list.
  function handleReplySaved(sessionId: string) {
    if (!selected) {
      router.replace(`/student/tutor?chat=${sessionId}`, { scroll: false });
    } else {
      router.refresh();
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-4 md:py-6">
      <div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* ---------- Chat list ---------- */}
        <aside className={`${showChatOnPhone ? "hidden" : "block"} min-w-0 md:block`}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <MessagesSquare className="h-5 w-5 text-orange-600" aria-hidden />
              Tutor chats
            </h1>
            <button onClick={() => startNewChat(newTopicKey)} className={`${buttonPrimary} px-3 py-2`}>
              <SquarePen className="h-4 w-4" aria-hidden />
              New chat
            </button>
          </div>

          {/* On laptops the list scrolls on its own, next to the chat. */}
          <ul className="space-y-1 md:max-h-[calc(100dvh-11rem)] md:overflow-y-auto md:pr-1">
            {chats.map((chat) => {
              const isOpen = chat.id === selected?.id;
              return (
                <li key={chat.id}>
                  <Link
                    href={`/student/tutor?chat=${chat.id}`}
                    aria-current={isOpen ? "page" : undefined}
                    className={`block rounded-xl border px-3 py-2.5 transition-colors ${
                      isOpen ? "border-orange-300 bg-orange-50" : "border-transparent hover:bg-white"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{chat.title}</span>
                      <span className="shrink-0 text-xs text-slate-400">{chat.when}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-slate-600">{chat.preview}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {chats.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
              <MessageCircle className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
              <p className="mt-2">No chats yet. Start one and it will be saved here.</p>
            </div>
          )}
        </aside>

        {/* ---------- Open chat ---------- */}
        {/* Height = screen height minus the header, so the typing box is always visible. */}
        <section
          className={`${showChatOnPhone ? "flex" : "hidden"} h-[calc(100dvh-6.5rem)] min-h-[420px] min-w-0 flex-col gap-3 md:flex md:h-[calc(100dvh-8rem)]`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/student/tutor"
              className="inline-flex items-center gap-1 rounded-lg py-1 pr-2 text-sm font-medium text-slate-600 hover:text-slate-900 md:hidden"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              All chats
            </Link>

            {/* A new chat can be about any topic; an earlier chat keeps its topic. */}
            {!selected && (
              <label className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                <span className="shrink-0 font-medium text-slate-600">Topic</span>
                <select
                  value={topicKey}
                  onChange={(e) => router.replace(`/student/tutor?topic=${e.target.value}`)}
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base sm:text-sm"
                >
                  {topicNames.map((topicName) => (
                    <optgroup key={topicName} label={topicName}>
                      {units
                        .filter((u) => u.topic === topicName)
                        .map((u) => (
                          <option key={u.key} value={u.key}>
                            {u.key} {u.title}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="min-h-0 flex-1">
            {/* key: switching to a different chat (or topic) starts the chat box fresh */}
            <TutorChat
              key={selected?.id ?? `new-${topicKey}`}
              topicKey={topicKey}
              topicTitle={unit?.title ?? ""}
              initialSessionId={selected?.id ?? null}
              initialMessages={selected?.messages ?? []}
              onNewChat={() => startNewChat(topicKey)}
              onReplySaved={handleReplySaved}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
