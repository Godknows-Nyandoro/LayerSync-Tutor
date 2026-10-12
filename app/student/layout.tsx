import { requireUser } from "@/lib/session";
import { AppHeader } from "@/components/AppHeader";

// Wraps every page under /student with the header.
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("STUDENT");
  return (
    <>
      <AppHeader name={user.name} role="STUDENT" />
      {children}
    </>
  );
}
