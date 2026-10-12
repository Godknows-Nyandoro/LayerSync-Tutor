// Asks the AI to draft a guide for a topic, then checks the reply before we save it.
// The result is always saved as a DRAFT: a teacher must approve it before students see it.

import { db } from "./db";
import { chatJson } from "./openrouter";
import type { DiagramName, GuideSection } from "@/data/guides";

// The code-drawn diagrams the AI may use for each topic (it cannot invent new ones).
const DIAGRAMS_FOR_TOPIC: Record<string, DiagramName[]> = {
  "1.1": ["binary-place-values", "hex-nibbles"],
  "10": ["logic-gates", "example-circuit"],
};

const KINDS = ["explain", "try", "check"];

export async function generateGuideSections(topicKey: string): Promise<GuideSection[]> {
  const objectives = await db.objective.findMany({ where: { subtopicId: topicKey }, orderBy: { sortOrder: "asc" } });
  const allowedDiagrams = DIAGRAMS_FOR_TOPIC[topicKey] ?? [];

  const system = `You write short, engaging learning guides for Cambridge IGCSE Computer Science 0478 students aged 14 to 16, who mostly read on a phone.
Rules:
- Cover every objective below and stick to its notes. Use simple English and short paragraphs.
- Follow explain -> try -> check: explain an idea, then give a "try" task with its answer, and end with one "check".
- Calculators are not allowed in the exam: show working by hand. Storage calculations use 1024, not 1000.
- Write your own examples. Do not copy past papers or textbooks.
- Plain text only (no markdown). Separate paragraphs in "body" with a blank line.

Reply with JSON only: {"sections": [{"kind": "explain" | "try" | "check", "heading": string, "body": string, "objectiveIds": string[], "diagram"?: string, "answer"?: string}]}
"answer" is required for "try" and "check" sections.
"diagram" is optional and must be one of: ${allowedDiagrams.join(", ") || "(none)"}.
Write 6 to 9 sections.`;

  const user = `Objectives:\n${objectives
    .map((o) => `- ${o.id}: ${o.statement}\n  Notes: ${o.notes.join("; ")}`)
    .join("\n")}`;

  const result = await chatJson(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    3000,
  );

  // Never trust the AI's JSON blindly: keep only well-formed sections with real objective IDs.
  const validIds = new Set(objectives.map((o) => o.id));
  const sections: GuideSection[] = (Array.isArray(result.sections) ? result.sections : [])
    .filter((s: GuideSection) => KINDS.includes(s.kind) && s.heading && s.body)
    .map((s: GuideSection) => ({
      kind: s.kind,
      heading: String(s.heading),
      body: String(s.body),
      objectiveIds: (s.objectiveIds ?? []).filter((id) => validIds.has(id)),
      ...(s.diagram && allowedDiagrams.includes(s.diagram) && { diagram: s.diagram }),
      ...(s.answer && { answer: String(s.answer) }),
    }));

  if (sections.length < 3) {
    throw new Error("The AI did not return a usable guide.");
  }
  return sections;
}
