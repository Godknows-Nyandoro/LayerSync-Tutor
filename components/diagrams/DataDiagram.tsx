// Draws a diagram from data: a flow of steps, a table, or a row of parts.
// Built with plain HTML and CSS, so text wraps nicely on a small phone screen.

import { ArrowDown, RotateCcw } from "lucide-react";
import type { DiagramData } from "@/data/guides";

function Flow({ steps, loop }: { steps: string[]; loop: boolean }) {
  return (
    <ol className="flex flex-col items-center">
      {steps.map((step, i) => (
        <li key={i} className="flex flex-col items-center">
          <div className="w-64 max-w-full rounded-xl border-2 border-orange-600 bg-white px-3 py-2 text-center text-sm">
            <span className="mr-1 font-bold text-orange-700">{i + 1}.</span>
            {step}
          </div>
          {/* an arrow between steps, but not after the last one */}
          {i < steps.length - 1 && <ArrowDown className="my-1 h-5 w-5 text-slate-400" aria-hidden />}
        </li>
      ))}
      {loop && (
        <li className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
          <RotateCcw className="h-4 w-4" aria-hidden />
          then back to step 1 and repeat
        </li>
      )}
    </ol>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse bg-white text-sm">
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="border border-slate-300 bg-orange-50 p-2 text-left">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className="border border-slate-300 p-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Parts({ parts }: { parts: { label: string; detail: string }[] }) {
  return (
    <div className="flex w-full">
      {parts.map((part, i) => (
        // Each part has a top, bottom and right border; only the first one adds a left border,
        // so neighbouring parts share a single line between them.
        <div
          key={i}
          className="flex-1 border-y-2 border-r-2 border-orange-600 bg-white p-2 text-center first:rounded-l-xl first:border-l-2 last:rounded-r-xl"
        >
          <p className="text-sm font-bold">{part.label}</p>
          {part.detail && <p className="mt-1 text-xs text-gray-600">{part.detail}</p>}
        </div>
      ))}
    </div>
  );
}

export function DataDiagram({ data }: { data: DiagramData }) {
  return (
    <figure className="w-full">
      {data.title && <figcaption className="mb-2 text-center text-sm font-semibold">{data.title}</figcaption>}
      {data.type === "flow" && <Flow steps={data.steps} loop={data.loop} />}
      {data.type === "table" && <Table headers={data.headers} rows={data.rows} />}
      {data.type === "parts" && <Parts parts={data.parts} />}
    </figure>
  );
}
