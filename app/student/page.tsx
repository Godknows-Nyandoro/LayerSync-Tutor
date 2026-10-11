import Link from "next/link";
import { requireUser } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";

// Student home. Topics and mastery are added in later steps.
export default async function StudentHome() {
  const user = await requireUser("STUDENT");

  return (
    <main className="mx-auto max-w-2xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hi, {user.name.split(" ")[0]}</h1>
        <LogoutButton />
      </div>
      <Link href="/syllabus" className="mt-4 inline-block text-blue-700 underline">
        Browse the syllabus
      </Link>
    </main>
  );
}
