// The bar at the top of every page after login: app name, links for the role, and log out.

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { NavLink } from "./NavLink";
import { LogoutButton } from "./LogoutButton";

export function AppHeader({ name, role }: { name: string; role: "STUDENT" | "TEACHER" }) {
  const home = role === "TEACHER" ? "/teacher" : "/student";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
        <Link href={home} className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white">
            <GraduationCap className="h-5 w-5" aria-hidden />
          </span>
          <span className="hidden sm:inline">Sync Tutor</span>
        </Link>

        <nav className="flex items-center gap-1">
          {role === "TEACHER" ? (
            <>
              <NavLink href="/teacher" label="Dashboard" icon="dashboard" alsoActiveOn={["/teacher/student", "/teacher/flags"]} />
              <NavLink href="/teacher/guides" label="Guides" icon="guides" alsoActiveOn={["/teacher/guides/"]} />
            </>
          ) : (
            <>
              <NavLink href="/student" label="My topics" icon="home" alsoActiveOn={["/student/topic"]} />
              <NavLink href="/student/tutor" label="Tutor" icon="tutor" />
            </>
          )}
          <NavLink href="/syllabus" label="Syllabus" icon="syllabus" />
          <span className="mx-1 hidden h-6 w-px bg-slate-200 md:block" />
          <span className="hidden text-sm text-slate-500 md:inline">{name}</span>
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
