import Link from "next/link";
import { db } from "@/lib/db";

// Always run on the server at request time (never cached at build time),
// so the page shows the live database status.
export const dynamic = "force-dynamic";

// Runs a tiny query to prove the app can reach the Neon database.
async function checkDatabase() {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export default async function Home() {
  const connected = await checkDatabase();

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Sync Academy Tutor</h1>
      <p className="mt-2 text-gray-600">IGCSE Computer Science 0478</p>
      <p className="mt-6">
        Database: {connected ? "connected ✅" : "not connected ❌"}
      </p>
      <Link href="/syllabus" className="mt-6 inline-block text-blue-700 underline">
        Browse the syllabus
      </Link>
    </main>
  );
}
