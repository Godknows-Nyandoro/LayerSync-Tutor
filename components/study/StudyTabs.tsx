"use client";
// The tabs on the study page: Learn, Ask tutor, Check, Progress.
//
// All four panels are sent to the browser once, and switching tabs just shows a different one.
// So switching is instant (no download on mobile data) and the chat or a half-done check is
// not lost when the student looks at another tab. The URL (?tab=check) is updated too,
// so refreshing the page keeps the same tab open.

import { createContext, useContext, useState } from "react";
import { BookOpen, ChartColumn, ClipboardCheck, MessageCircle } from "lucide-react";

// Icons are picked by name, because a Server Component cannot pass icon components to a Client Component.
const ICONS = { learn: BookOpen, tutor: MessageCircle, check: ClipboardCheck, progress: ChartColumn };

export type TabKey = keyof typeof ICONS;
export type Panel = { key: TabKey; label: string; content: React.ReactNode };

// Lets a panel open another tab, e.g. the guide's last step has a "Practise with the tutor" button.
const StudyTabsContext = createContext<{ open: (key: TabKey) => void } | null>(null);
export function useStudyTabs() {
  return useContext(StudyTabsContext);
}

export function StudyTabs({ panels, initialTab }: { panels: Panel[]; initialTab: TabKey }) {
  const [active, setActive] = useState<TabKey>(initialTab);

  function open(key: TabKey) {
    setActive(key);
    // Change ?tab= in the address bar without reloading the page.
    window.history.replaceState(null, "", `?tab=${key}`);
  }

  return (
    <StudyTabsContext.Provider value={{ open }}>
      {/* On phones the icon sits above a small label so all four tabs fit; wider screens put them side by side. */}
      <div role="tablist" className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {panels.map((panel) => {
          const Icon = ICONS[panel.key];
          const isActive = panel.key === active;
          return (
            <button
              key={panel.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => open(panel.key)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1 py-2 text-xs font-medium transition-colors sm:flex-row sm:gap-2 sm:px-3 sm:text-sm ${
                isActive ? "bg-white text-orange-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden />
              {panel.label}
            </button>
          );
        })}
      </div>

      {/* Only the active panel is visible; the others stay in the page but hidden, keeping their state. */}
      {panels.map((panel) => (
        <div key={panel.key} role="tabpanel" hidden={panel.key !== active} className="mt-5">
          {panel.content}
        </div>
      ))}
    </StudyTabsContext.Provider>
  );
}
