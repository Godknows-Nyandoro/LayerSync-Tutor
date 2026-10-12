// Every sub-topic of the syllabus is a "unit" a student can study: guide, tutor and check.
// `key` matches Objective.subtopicId in the database ("1.1", "2.3", "7", "10", ...).
// Topics 7, 9 and 10 have no sub-topics, so the whole topic is one unit.

import { syllabus } from "./syllabus";

// The two units built in full (rich guides with diagrams, larger checks, seeded history).
export const MAIN_UNIT_KEYS = ["1.1", "10"];

export type Unit = {
  key: string; // e.g. "1.1"
  title: string; // e.g. "Number systems"
  topic: string; // e.g. "1 Data representation"
  topicNumber: number;
  isMain: boolean;
};

export const units: Unit[] = syllabus.flatMap((topic) =>
  topic.subtopics.map((subtopic) => ({
    key: subtopic.id,
    title: subtopic.title,
    topic: `${topic.number} ${topic.title}`,
    topicNumber: topic.number,
    isMain: MAIN_UNIT_KEYS.includes(subtopic.id),
  })),
);

export const mainUnits = units.filter((unit) => unit.isMain);

export function findUnit(key: string) {
  return units.find((unit) => unit.key === key);
}
