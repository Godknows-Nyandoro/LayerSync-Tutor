import Link from "next/link";
import { requireUser } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";

// Teacher home. The class dashboard is added in a later step.
export default async function TeacherHome() {
  const user = await requireUser("TEACHER");

  return (
    <main className="mx-auto max-w-4xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <LogoutButton />
      </div>
      <Link href="/syllabus" className="mt-4 inline-block text-blue-700 underline">
        Browse the syllabus
      </Link>
    </main>
  );
}
