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

export function TutorChat({ topicKey, topicTitle }: { topicKey: string; topicTitle: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
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

    const response = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicKey, sessionId, message: text }),
    });

    if (!response.ok || !response.body) {
      const error = await response.text();
      setMessages((old) => [...old.slice(0, -1), { role: "assistant", content: error }]);
      setBusy(false);
      return;
    }

    setSessionId(response.headers.get("X-Session-Id"));
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
  }

  function newChat() {
    setMessages([]);
    setSessionId(null);
  }

  return (
    // A fixed-height panel: messages scroll inside it, and the typing box stays at the bottom.
    // 100dvh minus about 19rem = the screen height left under the header, title and tabs.
    <section className="flex h-[calc(100dvh-19rem)] min-h-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:h-[600px]">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-700">
            <Bot className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Tutor</h2>
            <p className="text-xs text-slate-500">Gives hints, not answers</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={newChat} className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100">
            <RotateCcw className="h-4 w-4" aria-hidden />
            New chat
          </button>
        )}
      </div>

      <div ref={scrollBox} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
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

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-slate-100 p-3"
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
