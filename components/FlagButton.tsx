"use client";
// "Flag" link under a tutor reply. Opens a tiny form: pick a reason, add an optional comment.

import { useState } from "react";

const REASONS = [
  { value: "WRONG", label: "It's wrong" },
  { value: "CONFUSING", label: "It's confusing" },
  { value: "GAVE_ANSWER", label: "It gave away the answer" },
  { value: "OTHER", label: "Something else" },
];

export function FlagButton({ sessionId, messageIndex }: { sessionId: string; messageIndex: number }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("CONFUSING");
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("sending");
    const response = await fetch("/api/tutor/flag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, messageIndex, reason, comment }),
    });
    setState(response.ok ? "sent" : "error");
  }

  if (state === "sent") {
    return <p className="mr-8 text-xs text-gray-500">🚩 Flagged. Your teacher will take a look.</p>;
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-gray-500 underline">
        🚩 Flag this reply
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mr-8 space-y-2 rounded border border-red-200 bg-red-50 p-2 text-xs">
      <p className="font-medium">What was wrong with this reply?</p>
      <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded border bg-white p-1">
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        placeholder="Tell your teacher more (optional)"
        className="w-full rounded border bg-white p-1"
      />
      {state === "error" && <p className="text-red-700">Could not send the flag. Please try again.</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={state === "sending"} className="rounded bg-red-700 px-2 py-1 text-white">
          {state === "sending" ? "Sending..." : "Send flag"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="underline">
          Cancel
        </button>
      </div>
    </form>
  );
}
