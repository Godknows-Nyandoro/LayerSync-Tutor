import { requireUser } from "@/lib/session";
import { AppHeader } from "@/components/AppHeader";

// Wraps every page under /teacher with the header.
export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("TEACHER");
  return (
    <>
      <AppHeader name={user.name} role="TEACHER" />
      {children}
    </>
  );
}
