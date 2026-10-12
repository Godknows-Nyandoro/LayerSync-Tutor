import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

// Teacher: list of guides and whether students can see them.
export default async function GuidesList() {
  await requireUser("TEACHER");
  const guides = await db.guide.findMany({ orderBy: { topicKey: "asc" } });

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href="/teacher" className="text-sm text-blue-700">
        ← Class dashboard
      </Link>
      <h1 className="text-2xl font-bold">Guides</h1>
      <p className="text-sm text-gray-600">Students only see a guide after you approve it.</p>

      <ul className="space-y-2">
        {guides.map((guide) => (
          <li key={guide.id}>
            <Link
              href={`/teacher/guides/${guide.topicKey}`}
              className="flex items-center justify-between rounded-lg border bg-white p-3 hover:border-blue-700"
            >
              <span className="font-medium">
                {guide.topicKey} {guide.title}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  guide.status === "APPROVED" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {guide.status === "APPROVED" ? "Live for students" : "Draft"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
