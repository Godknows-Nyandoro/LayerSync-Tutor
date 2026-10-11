// Sync Academy, Form 4 IGCSE Computer Science, class 4C.
// All people here are fictitious (from the assignment brief).

export const CLASS_NAME = "4C";

// Every seeded account uses this password, so the demo is easy to log in to.
export const DEMO_PASSWORD = "Sync2026!";

export const teacher = {
  name: "Mrs Rudo Moyo",
  email: "rudo.moyo@syncacademy.test",
};

// "profile" says what history the seed should simulate for each student.
export const students = [
  { code: "SA-001", name: "Tatenda Chikore", profile: "Strong all round; most objectives mastered" },
  { code: "SA-002", name: "Rutendo Mapfumo", profile: "Strong on Boolean logic; weak on hexadecimal" },
  { code: "SA-003", name: "Kudzai Ndlovu", profile: "Struggling with two's complement; many tutor sessions" },
  { code: "SA-004", name: "Farai Mutasa", profile: "Average; steady weekly activity" },
  { code: "SA-005", name: "Anesu Gumbo", profile: "Inactive; no logins in the last 7 days" },
  { code: "SA-006", name: "Tanaka Sibanda", profile: "High scores but very few tutor sessions" },
  { code: "SA-007", name: "Chipo Makoni", profile: "Struggling with truth tables; improving this week" },
  { code: "SA-008", name: "Tinashe Dube", profile: "Average; repeated attempts on overflow" },
  { code: "SA-009", name: "Vimbai Chirwa", profile: "Strong on number systems; not started Boolean logic" },
  { code: "SA-010", name: "Takudzwa Nyathi", profile: "New student; only completed the first guide" },
];

// "Tatenda Chikore" -> "tatenda.chikore@syncacademy.test"
export function emailFor(name: string) {
  return name.toLowerCase().replace(" ", ".") + "@syncacademy.test";
}
