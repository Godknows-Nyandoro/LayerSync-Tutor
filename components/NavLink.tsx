"use client";
// A header link that is highlighted when you are on that page.
// It runs in the browser because it needs the current URL (usePathname).

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, House, LayoutDashboard, Library, MessageCircle } from "lucide-react";

// Icons are picked by name, because a Server Component cannot pass an icon component to a Client Component.
const ICONS = { home: House, dashboard: LayoutDashboard, guides: FileText, syllabus: Library, tutor: MessageCircle };

type Props = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  alsoActiveOn?: string[]; // other URL beginnings that belong to this link
};

export function NavLink({ href, label, icon, alsoActiveOn = [] }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href || alsoActiveOn.some((start) => pathname.startsWith(start));
  const Icon = ICONS[icon];

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
        isActive ? "bg-orange-50 text-orange-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {/* On small phones only the icon shows, to save space (screen readers still read the label) */}
      <span className="sr-only sm:not-sr-only">{label}</span>
    </Link>
  );
}
