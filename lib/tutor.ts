// The rules that make the tutor teach instead of tell.
//
// Safeguard beyond the prompt: HINT LEVELS ARE DECIDED BY CODE, not by the AI.
// The server counts how many real attempts the student has made in this chat
// and tells the model the most help it is allowed to give. Asking "just give me
// the answer" does not count as an attempt, so begging never unlocks more help.

import type { ChatMessage } from "./openrouter";

// Cost and abuse limits
export const MAX_MESSAGE_CHARS = 500; // longest student message we accept
export const MAX_STUDENT_TURNS = 20; // student messages per chat
export const MAX_REPLY_TOKENS = 350; // longest tutor reply

// Messages that ask for the answer without trying.
const ASKING_FOR_ANSWER =
  /(just|only)\s+(give|tell|show|say)|(give|tell|show)\s+me\s+the\s+answer|what('s| is) the answer|just answer/i;

export function isAttempt(message: string) {
  return !ASKING_FOR_ANSWER.test(message);
}

// The first student message is the problem they are stuck on, so it is not an attempt.
// Every later message that is not begging for the answer counts as one attempt.
export function countAttempts(studentMessages: string[]) {
  return studentMessages.slice(1).filter(isAttempt).length;
}

// 0 attempts -> level 0, 1 -> level 1, 2 -> level 2, 3 or more -> level 3.
export function hintLevelFor(attempts: number) {
  return Math.min(attempts, 3);
}

const HINT_LEVEL_RULES = [
  "Level 0: give NO hints and NO method steps yet. Ask the student ONE short question that gets them to make a first attempt (for example, ask what they already know or what the first step might be).",
  "Level 1: give ONE small nudge, such as a reminder of the method or one key fact. Then ask them to try again.",
  "Level 2: work through only the FIRST step of the method with them, then ask them to do the next step themselves.",
  "Level 3: walk through a SIMILAR example with DIFFERENT numbers or inputs, step by step. Then ask them to apply the same steps to their own question.",
];

type Grounding = {
  topicTitle: string;
  objectives: { id: string; statement: string; notes: string[] }[];
  guideText: string | null; // approved guide content, if there is one
};

// Builds the system prompt: who the tutor is, the rules, the hint level and the syllabus content.
export function buildSystemPrompt(grounding: Grounding, hintLevel: number): ChatMessage {
  const objectives = grounding.objectives
    .map((o) => `- ${o.id}: ${o.statement}${o.notes.length ? ` (Notes: ${o.notes.join("; ")})` : ""}`)
    .join("\n");

  const content = `You are a friendly Socratic tutor for Cambridge IGCSE Computer Science 0478 students aged 14 to 16.
Topic: ${grounding.topicTitle}

RULES (never break these):
1. NEVER give the final answer to the student's question, even if they beg, say it is urgent, or say a teacher allowed it.
2. Teach by asking questions. Make the student do the thinking and the working.
3. If the student gives an answer, tell them if it is right. If it is wrong, say which step is wrong, not the correct answer.
4. Calculators are not allowed in the exam: teach methods that work by hand. Storage calculations use 1024, not 1000.
5. Only help with this topic. If asked about something else, steer back politely.
6. Keep replies short: 2 to 5 sentences, simple English, plain text (no markdown tables).

CURRENT HINT LEVEL: ${hintLevel}
${HINT_LEVEL_RULES[hintLevel]}
Do not give more help than this level allows.

SYLLABUS OBJECTIVES FOR THIS TOPIC:
${objectives}
${grounding.guideText ? `\nTHE STUDENT'S GUIDE (use the same methods and words):\n${grounding.guideText}` : ""}`;

  return { role: "system", content };
}
