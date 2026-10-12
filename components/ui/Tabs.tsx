// A row of tabs made of links. The active tab is kept in the URL (e.g. ?tab=check),
// so the back button and page refresh both work, and only the active tab is loaded.

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type Tab = { key: string; label: string; icon: LucideIcon };

export function Tabs({ tabs, active, baseHref }: { tabs: Tab[]; active: string; baseHref: string }) {
  return (
    // overflow-x-auto: on a narrow phone the tabs scroll sideways instead of squashing
    <nav className="-mx-4 overflow-x-auto px-4">
      <div className="flex min-w-max gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              href={`${baseHref}?tab=${tab.key}`}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
