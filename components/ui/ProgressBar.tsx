// A thin bar that fills up from 0% to 100%.

export function ProgressBar({ percent, color = "bg-green-500" }: { percent: number; color?: string }) {
  const width = Math.max(0, Math.min(100, percent)); // keep it between 0 and 100
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}
