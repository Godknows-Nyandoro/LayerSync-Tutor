// Fake history for each seeded student, so the teacher dashboard has something real to show.
// Each plan matches the student's profile in data/class.ts.

export type StudentHistory = {
  lastLoginDaysAgo: number;
  // Checks taken: on which topic, how many days ago, and how well (fraction of marks, 0 to 1).
  checks: { topicKey: string; daysAgo: number; skill: number }[];
  // Questions where the student did better or worse than their usual skill.
  overrides?: Record<string, number>;
  // Earlier, weaker attempts at a question (before the final one).
  retries?: Record<string, { daysAgo: number; fraction: number }[]>;
  // Number of tutor chats per topic.
  tutorSessions: Record<string, number>;
  // A tutor reply the student flagged, so the teacher's dashboard shows one.
  flag?: { topicKey: string; studentMessage: string; tutorReply: string; reason: "WRONG" | "CONFUSING" | "GAVE_ANSWER" | "OTHER"; comment: string };
};

export const history: Record<string, StudentHistory> = {
  // Strong all round; most objectives mastered
  "SA-001": {
    lastLoginDaysAgo: 1,
    checks: [
      { topicKey: "1.1", daysAgo: 6, skill: 1 },
      { topicKey: "10", daysAgo: 3, skill: 1 },
    ],
    overrides: { "1.1-8": 0 },
    tutorSessions: { "1.1": 1, "10": 1 },
  },
  // Strong on Boolean logic; weak on hexadecimal
  "SA-002": {
    lastLoginDaysAgo: 2,
    checks: [
      { topicKey: "1.1", daysAgo: 5, skill: 1 },
      { topicKey: "10", daysAgo: 2, skill: 1 },
    ],
    overrides: { "1.1-3": 0, "1.1-4": 0 },
    tutorSessions: { "1.1": 2, "10": 1 },
  },
  // Struggling with two's complement; many tutor sessions
  "SA-003": {
    lastLoginDaysAgo: 0,
    checks: [
      { topicKey: "10", daysAgo: 4, skill: 0.67 },
      { topicKey: "1.1", daysAgo: 1, skill: 0.67 },
    ],
    overrides: { "1.1-7": 0, "1.1-8": 0 },
    retries: {
      "1.1-7": [
        { daysAgo: 6, fraction: 0 },
        { daysAgo: 3, fraction: 0 },
      ],
      "1.1-8": [{ daysAgo: 6, fraction: 0 }],
    },
    tutorSessions: { "1.1": 7, "10": 1 },
    flag: {
      topicKey: "1.1",
      studentMessage: "how do I write -45 in two's complement?",
      tutorReply:
        "Good question! Start with +45 in binary. Then think about what happens to each bit when you invert it, and what you need to add at the end. What do you get for +45?",
      reason: "CONFUSING",
      comment: "I still don't understand why we add 1 at the end",
    },
  },
  // Average; steady weekly activity
  "SA-004": {
    lastLoginDaysAgo: 3,
    checks: [
      { topicKey: "1.1", daysAgo: 14, skill: 0.67 },
      { topicKey: "10", daysAgo: 7, skill: 0.67 },
    ],
    tutorSessions: { "1.1": 2, "10": 2 },
  },
  // Inactive; no logins in the last 7 days
  "SA-005": {
    lastLoginDaysAgo: 12,
    checks: [{ topicKey: "1.1", daysAgo: 13, skill: 0.5 }],
    tutorSessions: { "1.1": 1 },
  },
  // High scores but very few tutor sessions
  "SA-006": {
    lastLoginDaysAgo: 1,
    checks: [
      { topicKey: "1.1", daysAgo: 4, skill: 1 },
      { topicKey: "10", daysAgo: 2, skill: 1 },
    ],
    tutorSessions: { "10": 1 },
  },
  // Struggling with truth tables; improving this week
  "SA-007": {
    lastLoginDaysAgo: 0,
    checks: [
      { topicKey: "1.1", daysAgo: 9, skill: 0.67 },
      { topicKey: "10", daysAgo: 0, skill: 0.67 },
    ],
    overrides: { "10-7": 1 },
    retries: {
      "10-5": [{ daysAgo: 7, fraction: 0 }],
      "10-6": [{ daysAgo: 7, fraction: 0 }],
      "10-7": [{ daysAgo: 7, fraction: 0 }],
    },
    tutorSessions: { "1.1": 1, "10": 4 },
  },
  // Average; repeated attempts on overflow
  "SA-008": {
    lastLoginDaysAgo: 2,
    checks: [
      { topicKey: "10", daysAgo: 5, skill: 0.67 },
      { topicKey: "1.1", daysAgo: 3, skill: 0.67 },
    ],
    retries: {
      "1.1-5": [
        { daysAgo: 8, fraction: 0 },
        { daysAgo: 6, fraction: 0.34 },
      ],
    },
    tutorSessions: { "1.1": 2, "10": 1 },
  },
  // Strong on number systems; not started Boolean logic
  "SA-009": {
    lastLoginDaysAgo: 1,
    checks: [{ topicKey: "1.1", daysAgo: 4, skill: 1 }],
    tutorSessions: { "1.1": 1 },
  },
  // New student; only completed the first guide (no checks yet)
  "SA-010": {
    lastLoginDaysAgo: 0,
    checks: [],
    tutorSessions: {},
  },
};
