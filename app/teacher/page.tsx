import Link from "next/link";
import { Activity, ChevronDown, ChevronRight, Flag, Layers, LayoutDashboard, TrendingDown, TriangleAlert, Users } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { FLAG_REASON_LABEL, getClassDashboard } from "@/lib/dashboard";
import { mainUnits } from "@/data/topics";
import { Tabs } from "@/components/ui/Tabs";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreBadge, lastLoginText } from "@/components/ScoreBadge";
import { card, wideContainer } from "@/components/ui/styles";

export const dynamic = "force-dynamic";

type Dashboard = Awaited<ReturnType<typeof getClassDashboard>>;

// Teacher dashboard, split into tabs: Overview (who needs help), Class (every student), Topics.
export default async function TeacherDashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await requireUser("TEACHER");
  const teacher = await db.user.findUniqueOrThrow({ where: { id: session.userId } });
  const data = await getClassDashboard(teacher.className);
  const { tab = "overview" } = await searchParams;

  return (
    <main className={`${wideContainer} space-y-5`}>
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Class {teacher.className}</h1>
        <p className="text-slate-600">IGCSE Computer Science · {teacher.name}</p>
      </div>

      <Tabs
        baseHref="/teacher"
        active={tab}
        tabs={[
          { key: "overview", label: "Overview", icon: LayoutDashboard, count: data.needsHelp.length + data.openFlags.length },
          { key: "class", label: "Class", icon: Users },
          { key: "topics", label: "Topics", icon: Layers },
        ]}
      />

      {tab === "class" ? <ClassTab data={data} /> : tab === "topics" ? <TopicsTab data={data} /> : <OverviewTab data={data} />}
    </main>
  );
}

// ---------- Overview: the things that need the teacher's attention ----------
function OverviewTab({ data }: { data: Dashboard }) {
  const stats = [
    { label: "Students", value: data.rows.length, icon: Users, color: "bg-slate-100 text-slate-700" },
    { label: "Active this week", value: data.activeThisWeek, icon: Activity, color: "bg-green-100 text-green-700" },
    { label: "Need help", value: data.needsHelp.length, icon: TriangleAlert, color: "bg-red-100 text-red-700" },
    { label: "Flagged replies", value: data.openFlags.length, icon: Flag, color: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`${card} flex items-center gap-3`}>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-600">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        {/* Needs help: who to talk to first */}
        <section className={`${card} min-w-0`}>
          <h2 className="flex items-center gap-2 font-semibold text-red-700">
            <TriangleAlert className="h-5 w-5" aria-hidden />
            Needs help
          </h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {data.needsHelp.map((student) => (
              <li key={student.id}>
                <Link href={`/teacher/student/${student.id}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-slate-50">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{student.name}</span>
                    {/* At most 3 reasons here, so the list stays short; the student page shows everything. */}
                    <span className="mt-1 flex flex-wrap gap-1">
                      {student.reasons.slice(0, 3).map((reason) => (
                        <span key={reason} className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">
                          {reason}
                        </span>
                      ))}
                      {student.reasons.length > 3 && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          +{student.reasons.length - 3} more
                        </span>
                      )}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                </Link>
              </li>
            ))}
            {data.needsHelp.length === 0 && <li className="py-3 text-sm text-slate-600">Nobody right now.</li>}
          </ul>
        </section>

        {/* Tutor replies that students were unhappy with */}
        <section className={`${card} min-w-0`}>
          <h2 className="flex items-center gap-2 font-semibold text-amber-700">
            <Flag className="h-5 w-5" aria-hidden />
            Flagged tutor replies
          </h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {data.openFlags.map((flag) => (
              <li key={flag.id}>
                <Link href={`/teacher/flags/${flag.id}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-slate-50">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">
                      {flag.student.name} <span className="font-normal text-slate-500">on {flag.session.topicKey}</span>
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                        {FLAG_REASON_LABEL[flag.reason]}
                      </span>
                      {flag.comment && <span className="ml-1">&ldquo;{flag.comment}&rdquo;</span>}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">{flag.createdAt.toLocaleDateString("en-GB")}</span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                </Link>
              </li>
            ))}
            {data.openFlags.length === 0 && <li className="py-3 text-sm text-slate-600">No flagged replies.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

// ---------- Class: every student in one table ----------
function ClassTab({ data }: { data: Dashboard }) {
  return (
    <section className={`${card} p-0 sm:p-0`}>
      {/* The table scrolls sideways on phones; the name column stays fixed on the left (sticky). */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="sticky left-0 bg-slate-50 px-4 py-3">Student</th>
              <th className="px-4 py-3">Last login</th>
              {mainUnits.map((unit) => (
                <th key={unit.key} className="px-4 py-3">
                  {unit.key} {unit.title}
                </th>
              ))}
              <th className="px-4 py-3">Mastered</th>
              <th className="px-4 py-3">Tutor chats (7 days)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.rows.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50">
                <td className="sticky left-0 bg-white px-4 py-3">
                  <Link href={`/teacher/student/${student.id}`} className="font-medium text-orange-700 hover:underline">
                    {student.name}
                  </Link>
                  {student.reasons.length > 0 && <TriangleAlert className="ml-1 inline h-4 w-4 text-red-500" aria-label="Needs help" />}
                </td>
                <td className={`px-4 py-3 ${student.daysInactive === null || student.daysInactive >= 7 ? "font-medium text-red-700" : "text-slate-600"}`}>
                  {lastLoginText(student.daysInactive)}
                </td>
                {mainUnits.map((unit) => (
                  <td key={unit.key} className="px-4 py-3">
                    <ScoreBadge percent={student.topicScores[unit.key]} />
                  </td>
                ))}
                <td className="px-4 py-3 text-slate-600">
                  {student.masteredCount} / {data.totalObjectives}
                </td>
                <td className="px-4 py-3 text-slate-600">{student.tutorChatsThisWeek}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---------- Topics: every unit, and the objectives the class finds hardest ----------
function TopicsTab({ data }: { data: Dashboard }) {
  const started = data.unitSummaries.filter((unit) => unit.isMain || unit.studentsTried > 0);
  const notStarted = data.unitSummaries.filter((unit) => !unit.isMain && unit.studentsTried === 0);

  return (
    <div className="grid items-start gap-5 lg:grid-cols-5">
      <section className={`${card} min-w-0 lg:col-span-2`}>
        <h2 className="flex items-center gap-2 font-semibold">
          <TrendingDown className="h-5 w-5 text-red-600" aria-hidden />
          Class weakest objectives
        </h2>
        <ul className="mt-4 space-y-4">
          {data.weakest.map((objective) => (
            <li key={objective.id} className="text-sm">
              <div className="flex justify-between gap-3">
                <span>
                  <span className="mr-1 font-mono text-xs font-semibold text-slate-500">{objective.id}</span>
                  {objective.statement}
                </span>
                <span className="shrink-0 font-semibold">{objective.average}%</span>
              </div>
              <div className="mt-1.5">
                <ProgressBar percent={objective.average ?? 0} color="bg-red-500" />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {objective.mastered} of {objective.attempted} students who tried it have mastered it
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${card} min-w-0 p-0 sm:p-0 lg:col-span-3`}>
        <h2 className="flex items-center gap-2 px-4 pt-4 font-semibold sm:px-5 sm:pt-5">
          <Layers className="h-5 w-5 text-orange-600" aria-hidden />
          All topics
        </h2>
        <p className="px-4 text-xs text-slate-500 sm:px-5">Class average of the latest check, for students who tried it.</p>
        {/* Topics someone has tried (and the main ones) are listed; the rest are folded away. */}
        <ul className="mt-3 divide-y divide-slate-100">
          {started.map((unit) => (
            <UnitSummaryRow key={unit.key} unit={unit} classSize={data.rows.length} />
          ))}
        </ul>
        {notStarted.length > 0 && (
          <details className="group border-t border-slate-100">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-slate-600 sm:px-5">
              {notStarted.length} topics not started yet
              <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {notStarted.map((unit) => (
                <UnitSummaryRow key={unit.key} unit={unit} classSize={data.rows.length} />
              ))}
            </ul>
          </details>
        )}
      </section>
    </div>
  );
}

function UnitSummaryRow({ unit, classSize }: { unit: Dashboard["unitSummaries"][number]; classSize: number }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <span className="min-w-0 flex-1 text-sm">
        <span className="mr-1 font-mono text-xs text-slate-500">{unit.key}</span>
        {unit.title}
        {unit.isMain && (
          <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">Main</span>
        )}
      </span>
      <span className="hidden shrink-0 text-xs text-slate-500 sm:inline">
        {unit.studentsTried}/{classSize} tried
      </span>
      <ScoreBadge percent={unit.average} />
    </li>
  );
}
