// Asks the AI to draft a guide for a topic, then checks the reply before we save it.
// The result is always saved as a DRAFT: a teacher must approve it before students see it.
//
// Diagrams: the AI never makes images. It only supplies the WORDS for a diagram as data
// (steps, table cells or parts), and our DataDiagram component draws it.

import { db } from "./db";
import { chatJson } from "./openrouter";
import type { DiagramData, DiagramName, GuideSection } from "@/data/guides";

// Hand-drawn diagrams the AI may also pick for the main topics.
const DRAWN_DIAGRAMS_FOR_TOPIC: Record<string, DiagramName[]> = {
  "1.1": ["binary-place-values", "hex-nibbles"],
  "10": ["logic-gates", "example-circuit"],
};

const KINDS = ["explain", "try", "check"];

// The AI's reply is untrusted JSON of unknown shape, so we read it loosely and check every field.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AiJson = any;

// Turn any value into a trimmed string of at most `max` characters.
function text(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

// Keep a diagram only if it is one of our three types and has enough content to draw.
function cleanDiagramData(raw: AiJson): DiagramData | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const title = text(raw.title, 80);

  if (raw.type === "flow" && Array.isArray(raw.steps)) {
    const steps = raw.steps.map((s: unknown) => text(s, 80)).filter(Boolean).slice(0, 8);
    if (steps.length >= 2) return { type: "flow", title, steps, loop: raw.loop === true };
  }
  if (raw.type === "table" && Array.isArray(raw.headers) && Array.isArray(raw.rows)) {
    const headers = raw.headers.map((h: unknown) => text(h, 40)).slice(0, 4);
    const rows = raw.rows
      .filter(Array.isArray)
      .slice(0, 10)
      .map((row: unknown[]) => headers.map((_: string, i: number) => text(row[i], 80)));
    if (headers.length >= 2 && rows.length >= 1) return { type: "table", title, headers, rows };
  }
  if (raw.type === "parts" && Array.isArray(raw.parts)) {
    const parts = raw.parts
      .slice(0, 5)
      .map((p: AiJson) => ({ label: text(p?.label, 30), detail: text(p?.detail, 80) }))
      .filter((p: { label: string }) => p.label);
    if (parts.length >= 2) return { type: "parts", title, parts };
  }
  return undefined;
}

// One request to the AI, cleaned into sections we can safely show.
async function requestSections(topicKey: string): Promise<GuideSection[]> {
  const objectives = await db.objective.findMany({ where: { subtopicId: topicKey }, orderBy: { sortOrder: "asc" } });
  const drawnDiagrams = DRAWN_DIAGRAMS_FOR_TOPIC[topicKey] ?? [];

  const system = `You write short, engaging learning guides for Cambridge IGCSE Computer Science 0478 students aged 14 to 16, who mostly read on a phone.
Rules:
- Cover every objective below and stick to its notes. Use simple English and short paragraphs.
- Follow explain -> try -> check: explain an idea, then give a "try" task with its answer, and end with one "check".
- Calculators are not allowed in the exam: show working by hand. Storage calculations use 1024, not 1000.
- Write your own examples. Do not copy past papers or textbooks.
- Plain text only (no markdown). Separate paragraphs in "body" with a blank line.

DIAGRAMS: include 1 to 3 diagrams, attached to the sections they explain, using "diagramData" in one of these shapes:
- A process or cycle: {"type": "flow", "title": string, "steps": [2 to 7 short steps in order], "loop": true if the last step goes back to the first}
- A comparison or truth table: {"type": "table", "title": string, "headers": [2 to 4 column names], "rows": [[one cell per column], ... up to 8 rows]}
- Something made of parts side by side (e.g. a data packet): {"type": "parts", "title": string, "parts": [{"label": short name, "detail": what it holds}, ... 2 to 5 parts]}
${drawnDiagrams.length ? `You may also set "diagram" to one of these ready-made drawings: ${drawnDiagrams.join(", ")}.` : ""}

Reply with JSON only: {"sections": [{"kind": "explain" | "try" | "check", "heading": string, "body": string, "objectiveIds": string[], "diagramData"?: object, ${drawnDiagrams.length ? '"diagram"?: string, ' : ""}"answer"?: string}]}
"answer" is required for "try" and "check" sections.
Write 6 to 9 sections.`;

  const user = `Objectives:\n${objectives
    .map((o) => `- ${o.id}: ${o.statement}\n  Notes: ${o.notes.join("; ")}`)
    .join("\n")}`;

  const result: AiJson = await chatJson(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    4000,
  );

  // Never trust the AI's JSON blindly: keep only well-formed sections with real objective IDs.
  const validIds = new Set(objectives.map((o) => o.id));
  const rawSections: AiJson[] = Array.isArray(result?.sections) ? result.sections : [];

  return rawSections
    .filter((s) => KINDS.includes(s?.kind) && s.heading && s.body)
    .map((s) => {
      const diagramData = cleanDiagramData(s.diagramData);
      const section: GuideSection = {
        kind: s.kind,
        heading: text(s.heading, 120),
        body: text(s.body, 3000),
        objectiveIds: (Array.isArray(s.objectiveIds) ? s.objectiveIds : []).filter((id: string) => validIds.has(id)),
      };
      if (drawnDiagrams.includes(s.diagram)) section.diagram = s.diagram;
      if (diagramData) section.diagramData = diagramData;
      if (s.answer) section.answer = text(s.answer, 1000);
      return section;
    });
}

// Every guide must have at least 3 sections and at least one diagram. Ask the AI twice at most.
export async function generateGuideSections(topicKey: string): Promise<GuideSection[]> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const sections = await requestSections(topicKey);
    const hasDiagram = sections.some((s) => s.diagram || s.diagramData);
    if (sections.length >= 3 && hasDiagram) return sections;
  }
  throw new Error("The AI did not return a usable guide with a diagram.");
}
