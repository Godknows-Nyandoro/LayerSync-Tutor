import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { units } from "@/data/topics";

export const dynamic = "force-dynamic";

const STATUS = {
  APPROVED: { label: "Live for students", className: "bg-green-100 text-green-800" },
  DRAFT: { label: "Draft", className: "bg-amber-100 text-amber-800" },
  NONE: { label: "No guide yet", className: "bg-gray-100 text-gray-600" },
};

// Teacher: every unit in the syllabus and the state of its guide.
export default async function GuidesList() {
  await requireUser("TEACHER");
  const guides = await db.guide.findMany({ select: { topicKey: true, status: true } });
  const statusByUnit = new Map(guides.map((g) => [g.topicKey, g.status]));

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href="/teacher" className="text-sm text-blue-700">
        ← Class dashboard
      </Link>
      <h1 className="text-2xl font-bold">Guides</h1>
      <p className="text-sm text-gray-600">
        Generate a draft with AI for any topic. Students only see a guide after you approve it.
      </p>

      <ul className="space-y-2">
        {units.map((unit) => {
          const status = STATUS[statusByUnit.get(unit.key) ?? "NONE"];
          return (
            <li key={unit.key}>
              <Link
                href={`/teacher/guides/${unit.key}`}
                className={`flex items-center justify-between gap-2 rounded-lg border bg-white p-3 hover:border-blue-700 ${
                  unit.isMain ? "border-2 border-blue-700" : ""
                }`}
              >
                <span>
                  <span className="block text-xs text-gray-500">
                    {unit.isMain && <span className="font-semibold text-blue-700">Main topic · </span>}
                    {unit.topic}
                  </span>
                  <span className="font-medium">
                    {unit.key} {unit.title}
                  </span>
                </span>
                <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                  {status.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
