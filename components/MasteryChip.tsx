// A small coloured label showing a mastery status. Used by students and teachers.

import { Circle, CircleCheck, CircleDot } from "lucide-react";

const STYLES = {
  NOT_STARTED: { label: "Not started", icon: Circle, className: "bg-slate-100 text-slate-600" },
  LEARNING: { label: "Learning", icon: CircleDot, className: "bg-amber-100 text-amber-800" },
  MASTERED: { label: "Mastered", icon: CircleCheck, className: "bg-green-100 text-green-800" },
};

export type Status = keyof typeof STYLES;

export function MasteryChip({ status, percent }: { status: Status; percent?: number }) {
  const style = STYLES[status];
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {style.label}
      {percent !== undefined && status !== "NOT_STARTED" && ` ${percent}%`}
    </span>
  );
}
