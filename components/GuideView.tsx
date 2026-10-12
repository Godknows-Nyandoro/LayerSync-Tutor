// Shows a guide: explain -> try -> check sections, each tagged with its objective IDs.
// "Show answer" uses <details>, so it works with no JavaScript.

import type { DiagramName, GuideSection } from "@/data/guides";
import { BinaryPlaceValues, HexNibbles } from "./diagrams/NumberDiagrams";
import { ExampleCircuit, LogicGates } from "./diagrams/LogicDiagrams";

// Diagram name (stored in the guide) -> the component that draws it.
const DIAGRAMS: Record<DiagramName, () => React.JSX.Element> = {
  "binary-place-values": BinaryPlaceValues,
  "hex-nibbles": HexNibbles,
  "logic-gates": LogicGates,
  "example-circuit": ExampleCircuit,
};

const KIND_STYLE = {
  explain: { label: "Explain", className: "bg-blue-100 text-blue-800" },
  try: { label: "Try it", className: "bg-purple-100 text-purple-800" },
  check: { label: "Check", className: "bg-green-100 text-green-800" },
};

export function GuideView({ sections }: { sections: GuideSection[] }) {
  return (
    <div className="space-y-3">
      {sections.map((section, index) => {
        const Diagram = section.diagram ? DIAGRAMS[section.diagram] : null;
        const kind = KIND_STYLE[section.kind];
        return (
          <article key={index} className="rounded-lg border bg-white p-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-2 py-0.5 font-medium ${kind.className}`}>{kind.label}</span>
              {section.objectiveIds.map((id) => (
                <span key={id} className="font-mono text-gray-500">
                  {id}
                </span>
              ))}
            </div>
            <h3 className="mt-1 font-semibold">{section.heading}</h3>
            {section.body.split("\n\n").map((paragraph, i) => (
              <p key={i} className="mt-2 text-sm leading-relaxed">
                {paragraph}
              </p>
            ))}
            {Diagram && (
              <div className="mt-3 flex justify-center rounded bg-gray-50 p-2">
                <Diagram />
              </div>
            )}
            {section.answer && (
              <details className="mt-3 rounded bg-gray-50 p-2 text-sm">
                <summary className="cursor-pointer font-medium text-blue-700">Show answer</summary>
                <p className="mt-2">{section.answer}</p>
              </details>
            )}
          </article>
        );
      })}
    </div>
  );
}
