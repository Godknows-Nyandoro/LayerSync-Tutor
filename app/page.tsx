import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// The home page has no content of its own: it sends each visitor to the right place.
export default async function Home() {
  const session = await getSession();

  if (!session) redirect("/login");
  redirect(session.role === "TEACHER" ? "/teacher" : "/student");
}
