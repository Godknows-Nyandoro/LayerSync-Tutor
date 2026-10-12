import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getClassDashboard } from "@/lib/dashboard";
import { builtTopics } from "@/data/topics";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

// Colour a percentage: red = weak, amber = getting there, green = strong.
function scoreClass(percent: number | null) {
  if (percent === null) return "text-gray-400";
  if (percent < 50) return "bg-red-100 text-red-800";
  if (percent < 80) return "bg-amber-100 text-amber-800";
  return "bg-green-100 text-green-800";
}

// Teacher dashboard: who needs help, the whole class, and the class's weakest objectives.
export default async function TeacherDashboard() {
  const session = await requireUser("TEACHER");
  const teacher = await db.user.findUniqueOrThrow({ where: { id: session.userId } });
  const data = await getClassDashboard(teacher.className);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Class {teacher.className}</h1>
          <p className="text-sm text-gray-600">{teacher.name}</p>
        </div>
        <LogoutButton />
      </div>

      <nav className="flex gap-4 text-sm">
        <Link href="/teacher/guides" className="text-blue-700 underline">
          Guides
        </Link>
        <Link href="/syllabus" className="text-blue-700 underline">
          Syllabus
        </Link>
      </nav>

      {/* Summary numbers */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border bg-white p-3">
          <p className="text-2xl font-bold">{data.rows.length}</p>
          <p className="text-xs text-gray-600">Students</p>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <p className="text-2xl font-bold">{data.activeThisWeek}</p>
          <p className="text-xs text-gray-600">Active this week</p>
        </div>
        <div className="rounded-lg border border-red-300 bg-red-50 p-3">
          <p className="text-2xl font-bold text-red-700">{data.needsHelp.length}</p>
          <p className="text-xs text-gray-600">Need help</p>
        </div>
      </div>

      {/* Needs help: first thing the teacher sees */}
      <section className="rounded-lg border border-red-300 bg-white p-3">
        <h2 className="font-semibold text-red-700">Needs help</h2>
        <ul className="mt-2 space-y-2">
          {data.needsHelp.map((student) => (
            <li key={student.id} className="text-sm">
              <Link href={`/teacher/student/${student.id}`} className="font-medium text-blue-700 underline">
                {student.name}
              </Link>
              <span className="text-gray-700">: {student.reasons.join(", ")}</span>
            </li>
          ))}
          {data.needsHelp.length === 0 && <li className="text-sm text-gray-600">Nobody right now.</li>}
        </ul>
      </section>

      {/* Whole class */}
      <section className="rounded-lg border bg-white p-3">
        <h2 className="font-semibold">Whole class</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-gray-500">
              <tr>
                <th className="p-2">Student</th>
                <th className="p-2">Last login</th>
                {builtTopics.map((topic) => (
                  <th key={topic.key} className="p-2">
                    {topic.key} {topic.title}
                  </th>
                ))}
                <th className="p-2">Mastered</th>
                <th className="p-2">Tutor chats (7 days)</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="p-2">
                    <Link href={`/teacher/student/${student.id}`} className="text-blue-700 underline">
                      {student.name}
                    </Link>
                  </td>
                  <td className={`p-2 ${student.daysInactive !== null && student.daysInactive >= 7 ? "text-red-700" : ""}`}>
                    {student.daysInactive === null
                      ? "Never"
                      : student.daysInactive === 0
                        ? "Today"
                        : `${student.daysInactive}d ago`}
                  </td>
                  {builtTopics.map((topic) => {
                    const percent = student.topicScores[topic.key];
                    return (
                      <td key={topic.key} className="p-2">
                        <span className={`rounded px-2 py-0.5 ${scoreClass(percent)}`}>
                          {percent === null ? "Not started" : `${percent}%`}
                        </span>
                      </td>
                    );
                  })}
                  <td className="p-2">
                    {student.masteredCount} / {data.totalObjectives}
                  </td>
                  <td className="p-2">{student.tutorChatsThisWeek}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Weakest objectives across the class */}
      <section className="rounded-lg border bg-white p-3">
        <h2 className="font-semibold">Class weakest objectives</h2>
        <ul className="mt-2 space-y-3">
          {data.weakest.map((objective) => (
            <li key={objective.id} className="text-sm">
              <div className="flex justify-between gap-2">
                <span>
                  <span className="font-mono font-semibold">{objective.id}</span> {objective.statement}
                </span>
                <span className="whitespace-nowrap font-medium">{objective.average}%</span>
              </div>
              <div className="mt-1 h-2 rounded bg-gray-200">
                <div className="h-2 rounded bg-red-500" style={{ width: `${objective.average}%` }} />
              </div>
              <p className="text-xs text-gray-500">
                {objective.mastered} of {objective.attempted} students who tried it have mastered it
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
