// The topics we built in full: they have a guide, a tutor and a check.
// `key` matches Objective.subtopicId in the database.
export const builtTopics = [
  { key: "1.1", title: "Number systems", topic: "1 Data representation" },
  { key: "10", title: "Boolean logic", topic: "10 Boolean logic" },
];

export function findBuiltTopic(key: string) {
  return builtTopics.find((topic) => topic.key === key);
}
