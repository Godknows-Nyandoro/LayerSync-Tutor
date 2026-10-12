// Shows guide sections (explain -> try -> check), each tagged with its objective IDs.
// GuideSectionCard = one section (the student sees one at a time).
// GuideView        = every section in a list (the teacher's preview).
// "Show answer" uses <details>, so it works with no JavaScript.

import { Eye, Lightbulb, PenLine, Target } from "lucide-react";
import type { DiagramName, GuideSection } from "@/data/guides";
import { BinaryPlaceValues, HexNibbles } from "./diagrams/NumberDiagrams";
import { ExampleCircuit, LogicGates } from "./diagrams/LogicDiagrams";
import { DataDiagram } from "./diagrams/DataDiagram";
import { card } from "./ui/styles";

// Diagram name (stored in the guide) -> the component that draws it.
const DIAGRAMS: Record<DiagramName, () => React.JSX.Element> = {
  "binary-place-values": BinaryPlaceValues,
  "hex-nibbles": HexNibbles,
  "logic-gates": LogicGates,
  "example-circuit": ExampleCircuit,
};

const KIND_STYLE = {
  explain: { label: "Explain", icon: Lightbulb, className: "bg-sky-100 text-sky-800" },
  try: { label: "Try it", icon: PenLine, className: "bg-violet-100 text-violet-800" },
  check: { label: "Quick check", icon: Target, className: "bg-green-100 text-green-800" },
};

export function GuideSectionCard({ section }: { section: GuideSection }) {
  const Diagram = section.diagram ? DIAGRAMS[section.diagram] : null;
  const kind = KIND_STYLE[section.kind];
  const KindIcon = kind.icon;

  return (
    <article className={card}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${kind.className}`}>
          <KindIcon className="h-3.5 w-3.5" aria-hidden />
          {kind.label}
        </span>
        {section.objectiveIds.map((id) => (
          <span key={id} className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
            {id}
          </span>
        ))}
      </div>

      <h3 className="mt-3 text-lg font-semibold sm:text-xl">{section.heading}</h3>
      <div className="mt-2 space-y-3 text-base leading-relaxed text-slate-700">
        {section.body.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {Diagram && (
        <div className="mt-4 flex justify-center rounded-xl bg-slate-50 p-3">
          <Diagram />
        </div>
      )}
      {section.diagramData && (
        <div className="mt-4 flex justify-center rounded-xl bg-slate-50 p-3">
          <DataDiagram data={section.diagramData} />
        </div>
      )}

      {section.answer && (
        <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-orange-700">
            <Eye className="h-4 w-4" aria-hidden />
            Show answer
          </summary>
          <p className="mt-2 text-base text-slate-700">{section.answer}</p>
        </details>
      )}
    </article>
  );
}

export function GuideView({ sections }: { sections: GuideSection[] }) {
  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <GuideSectionCard key={index} section={section} />
      ))}
    </div>
  );
}
