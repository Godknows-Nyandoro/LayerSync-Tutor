"use client";
// "Flag" link under a tutor reply. Opens a tiny form: pick a reason, add an optional comment.

import { useState } from "react";
import { Flag } from "lucide-react";

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
    return (
      <p className="flex items-center gap-1 text-xs text-slate-500">
        <Flag className="h-3.5 w-3.5 fill-red-500 text-red-500" aria-hidden />
        Flagged. Your teacher will take a look.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded px-1 py-0.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-red-600"
      >
        <Flag className="h-3.5 w-3.5" aria-hidden />
        Flag this reply
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm">
      <p className="flex items-center gap-1.5 font-medium text-red-800">
        <Flag className="h-4 w-4" aria-hidden />
        What was wrong with this reply?
      </p>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        aria-label="Reason"
        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-base"
      >
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
        aria-label="Comment"
        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-base"
      />
      {state === "error" && <p className="text-red-700">Could not send the flag. Please try again.</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {state === "sending" ? "Sending..." : "Send flag"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-white">
          Cancel
        </button>
      </div>
    </form>
  );
}
