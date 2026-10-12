// A row of tabs made of links, used by the teacher dashboard.
// The active tab is kept in the URL (e.g. ?tab=class), so the back button and refresh both work.
// (The student study page uses StudyTabs instead, which keeps the chat and check alive between tabs.)

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type Tab = { key: string; label: string; icon: LucideIcon; count?: number };

export function Tabs({ tabs, active, baseHref }: { tabs: Tab[]; active: string; baseHref: string }) {
  return (
    // On phones the icon sits above a small label so every tab fits; wider screens put them side by side.
    <nav className="flex gap-1 rounded-xl bg-slate-100 p-1">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.key}
            href={`${baseHref}?tab=${tab.key}`}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1 py-2 text-xs font-medium transition-colors sm:flex-row sm:gap-2 sm:px-3 sm:text-sm ${
              isActive ? "bg-white text-orange-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden />
            <span>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">{tab.count}</span>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
