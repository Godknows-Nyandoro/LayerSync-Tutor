"use client";
// The chat screen. Runs in the browser so it can show the reply word by word as it streams in.

import { useEffect, useRef, useState } from "react";
import { Bot, Lightbulb, RotateCcw, Send, UserRound } from "lucide-react";
import { FlagButton } from "./FlagButton";

// replyIndex: where a tutor reply is saved in the chat on the server (needed to flag it).
type Message = { role: "user" | "assistant"; content: string; replyIndex?: number };

// Starter ideas shown in an empty chat, so students know what they can ask.
const SUGGESTIONS = [
  "I don't understand this topic. Where do I start?",
  "Give me a practice question",
  "Can you check my working?",
];

// Shown when the server cannot be reached (e.g. the free database is waking up).
const BUSY_MESSAGE =
  "Sorry, the system is a little busy right now. We use a free database that can take a few seconds to wake up. Please wait a moment and send your message again.";

type Props = {
  topicKey: string;
  topicTitle: string;
  initialSessionId?: string | null; // set when opening an earlier chat
  initialMessages?: Message[];
  onNewChat: () => void;
  onReplySaved?: (sessionId: string) => void; // tells the page a reply was saved, so it can refresh the chat list
  newChatOnPhoneOnly?: boolean; // hide this "New chat" button on wide screens, where the chat list has one
};

export function TutorChat({
  topicKey,
  topicTitle,
  initialSessionId = null,
  initialMessages = [],
  onNewChat,
  onReplySaved,
  newChatOnPhoneOnly = false,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollBox = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as replies stream in.
  useEffect(() => {
    scrollBox.current?.scrollTo({ top: scrollBox.current.scrollHeight });
  }, [messages]);

  async function send(text: string) {
    text = text.trim();
    if (!text || busy) return;

    setInput("");
    setBusy(true);
    // Show the student's message, plus an empty tutor message we fill in as the reply streams.
    setMessages((old) => [...old, { role: "user", content: text }, { role: "assistant", content: "" }]);

    // Replace the empty tutor message with an error message.
    function showError(content: string) {
      setMessages((old) => [...old.slice(0, -1), { role: "assistant", content }]);
      setBusy(false);
    }

    let response: Response;
    try {
      response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicKey, sessionId, message: text }),
      });
    } catch {
      return showError(BUSY_MESSAGE); // no connection at all
    }

    if (response.status >= 500 || !response.body) return showError(BUSY_MESSAGE);
    if (!response.ok) return showError(await response.text()); // e.g. "message too long"

    const newSessionId = response.headers.get("X-Session-Id")!;
    setSessionId(newSessionId);
    const replyIndex = Number(response.headers.get("X-Reply-Index"));
    setMessages((old) => [...old.slice(0, -1), { ...old[old.length - 1], replyIndex }]);

    // Read the stream piece by piece and add each piece to the last message.
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const piece = decoder.decode(value, { stream: true });
      setMessages((old) => {
        const last = old[old.length - 1];
        return [...old.slice(0, -1), { ...last, content: last.content + piece }];
      });
    }
    setBusy(false);
    onReplySaved?.(newSessionId);
  }

  return (
    // A fixed-height panel: messages scroll inside it, and the typing box stays at the bottom.
    // 100dvh minus about 19rem = the screen height left under the header, title and tabs.
    // It fills the height its parent gives it: messages scroll inside, and the typing box stays at the bottom.
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700">
            <Bot className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">
              {topicKey} {topicTitle}
            </h2>
            <p className="text-xs text-slate-500">Gives hints, not answers</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={onNewChat}
            className={`${newChatOnPhoneOnly ? "flex md:hidden" : "flex"} shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100`}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            New chat
          </button>
        )}
      </div>

      <div ref={scrollBox} className="flex-1 overflow-y-auto px-4 py-4">
        {/* max-w-3xl keeps lines short enough to read comfortably on a wide screen */}
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="mx-auto max-w-sm py-6 text-center">
              <Lightbulb className="mx-auto h-8 w-8 text-orange-500" aria-hidden />
              <p className="mt-2 font-medium">Stuck on {topicTitle}?</p>
              <p className="mt-1 text-sm text-slate-600">
                Ask a question or type your attempt. The tutor helps you work it out step by step.
              </p>
              <div className="mt-4 space-y-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => send(suggestion)}
                    className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:border-orange-300 hover:bg-orange-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => {
            const isStudent = message.role === "user";
            const isStreaming = busy && index === messages.length - 1;
            const canFlag = !isStudent && message.replyIndex !== undefined && sessionId && !isStreaming;
            return (
              <div key={index} className={`flex gap-2 ${isStudent ? "flex-row-reverse" : ""}`}>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isStudent ? "bg-slate-200 text-slate-600" : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {isStudent ? <UserRound className="h-4 w-4" aria-hidden /> : <Bot className="h-4 w-4" aria-hidden />}
                </span>
                <div className={`max-w-[80%] space-y-1 ${isStudent ? "items-end" : ""}`}>
                  <p
                    className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-base leading-relaxed ${
                      isStudent ? "rounded-tr-sm bg-orange-700 text-white" : "rounded-tl-sm bg-slate-100 text-slate-800"
                    }`}
                  >
                    {message.content || <span className="animate-pulse text-slate-400">Thinking...</span>}
                  </p>
                  {canFlag && <FlagButton sessionId={sessionId} messageIndex={message.replyIndex!} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="mx-auto flex w-full max-w-3xl gap-2 border-t border-slate-100 p-3 md:border-t-0 md:pb-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          placeholder="Ask, or type your attempt"
          aria-label="Message the tutor"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-700 text-white hover:bg-orange-800 disabled:opacity-50"
        >
          <Send className="h-5 w-5" aria-hidden />
        </button>
      </form>
    </section>
  );
}
