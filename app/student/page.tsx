import Link from "next/link";
import { requireUser } from "@/lib/session";
import { builtTopics } from "@/data/topics";
import { LogoutButton } from "@/components/LogoutButton";

// Student home: pick a topic. Mastery is added in a later step.
export default async function StudentHome() {
  const user = await requireUser("STUDENT");

  return (
    <main className="mx-auto max-w-2xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hi, {user.name.split(" ")[0]}</h1>
        <LogoutButton />
      </div>

      <h2 className="mt-6 font-semibold">My topics</h2>
      <ul className="mt-2 space-y-2">
        {builtTopics.map((topic) => (
          <li key={topic.key}>
            <Link
              href={`/student/topic/${topic.key}`}
              className="block rounded-lg border bg-white p-3 hover:border-blue-700"
            >
              <span className="text-sm text-gray-500">{topic.topic}</span>
              <span className="block font-medium">
                {topic.key} {topic.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/syllabus" className="mt-6 inline-block text-blue-700 underline">
        Browse the syllabus
      </Link>
    </main>
  );
}
