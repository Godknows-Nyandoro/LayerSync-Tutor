"use client";
// The tabs on the study page: Learn, Ask tutor, Check, Progress.
//
// Learn, Check and Progress are sent to the browser once, and switching between them just shows
// a different one. So switching is instant (no download on mobile data) and a half-done check
// is not lost. The URL (?tab=check) is updated too, so refreshing keeps the same tab open.
// "Ask tutor" is a link: the tutor has its own page with the student's chat history.

import Link from "next/link";
import { useState } from "react";
import { BookOpen, ChartColumn, ClipboardCheck, MessageCircle } from "lucide-react";

// Icons are picked by name, because a Server Component cannot pass icon components to a Client Component.
const ICONS = { learn: BookOpen, check: ClipboardCheck, progress: ChartColumn };

export type TabKey = keyof typeof ICONS;
export type Panel = { key: TabKey; label: string; content: React.ReactNode };

const tabStyle =
  "flex flex-1 flex-col items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1 py-2 text-xs font-medium transition-colors sm:flex-row sm:gap-2 sm:px-3 sm:text-sm";

function TabButton({ panel, isActive, onOpen }: { panel: Panel; isActive: boolean; onOpen: (key: TabKey) => void }) {
  const Icon = ICONS[panel.key];
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => onOpen(panel.key)}
      className={`${tabStyle} ${isActive ? "bg-white text-orange-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
    >
      <Icon className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden />
      {panel.label}
    </button>
  );
}

export function StudyTabs({ panels, initialTab, tutorHref }: { panels: Panel[]; initialTab: TabKey; tutorHref: string }) {
  const [active, setActive] = useState<TabKey>(initialTab);

  function open(key: TabKey) {
    setActive(key);
    // Change ?tab= in the address bar without reloading the page.
    window.history.replaceState(null, "", `?tab=${key}`);
  }

  return (
    <>
      {/* On phones the icon sits above a small label so all four fit; wider screens put them side by side. */}
      <div role="tablist" className="flex gap-1 rounded-xl bg-slate-100 p-1">
        <TabButton panel={panels[0]} isActive={panels[0].key === active} onOpen={open} />
        <Link href={tutorHref} className={`${tabStyle} text-slate-600 hover:text-slate-900`}>
          <MessageCircle className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden />
          Ask tutor
        </Link>
        {panels.slice(1).map((panel) => (
          <TabButton key={panel.key} panel={panel} isActive={panel.key === active} onOpen={open} />
        ))}
      </div>

      {/* Only the active panel is visible; the others stay in the page but hidden, keeping their state. */}
      {panels.map((panel) => (
        <div key={panel.key} role="tabpanel" hidden={panel.key !== active} className="mt-5">
          {panel.content}
        </div>
      ))}
    </>
  );
}
