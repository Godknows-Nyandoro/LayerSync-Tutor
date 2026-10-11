// A small coloured label showing a mastery status. Used by students and teachers.

const STYLES = {
  NOT_STARTED: { label: "Not started", className: "bg-gray-100 text-gray-600" },
  LEARNING: { label: "Learning", className: "bg-amber-100 text-amber-800" },
  MASTERED: { label: "Mastered", className: "bg-green-100 text-green-800" },
};

export type Status = keyof typeof STYLES;

export function MasteryChip({ status, percent }: { status: Status; percent?: number }) {
  const style = STYLES[status];
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${style.className}`}>
      {style.label}
      {percent !== undefined && status !== "NOT_STARTED" && ` ${percent}%`}
    </span>
  );
}
