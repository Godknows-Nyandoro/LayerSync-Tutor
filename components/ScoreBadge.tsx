// A coloured percentage for teacher views: red = weak, amber = getting there, green = strong.

export function scoreColor(percent: number | null) {
  if (percent === null) return "bg-slate-100 text-slate-500";
  if (percent < 50) return "bg-red-100 text-red-800";
  if (percent < 80) return "bg-amber-100 text-amber-800";
  return "bg-green-100 text-green-800";
}

export function ScoreBadge({ percent }: { percent: number | null }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${scoreColor(percent)}`}>
      {percent === null ? "Not started" : `${percent}%`}
    </span>
  );
}

// "Today", "1 day ago", "12 days ago" or "Never".
export function lastLoginText(days: number | null) {
  if (days === null) return "Never";
  if (days === 0) return "Today";
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
