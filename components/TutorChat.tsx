"use client";
// The chat box. Runs in the browser so it can show the reply word by word as it streams in.

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export function TutorChat({ topicKey }: { topicKey: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
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
    <section className="rounded-lg border bg-white p-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Stuck? Ask the tutor</h2>
        {messages.length > 0 && (
          <button onClick={newChat} className="text-sm text-gray-600 underline">
            New chat
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500">The tutor gives hints, not answers. Try each step yourself.</p>

      <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">
        {messages.map((message, index) => (
          <p
            key={index}
            className={`whitespace-pre-wrap rounded p-2 text-sm ${
              message.role === "user" ? "ml-8 bg-blue-50" : "mr-8 bg-gray-100"
            }`}
          >
            {message.content || "…"}
          </p>
        ))}
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          placeholder="Type your question or your attempt"
          className="flex-1 rounded border p-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-blue-700 px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </section>
  );
}
