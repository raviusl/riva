"use client";

import Link from "next/link";

import { uiZh } from "@/config/ui-zh";
import { cn } from "@/lib/utils";

export type WorkspaceTabItem = {
  id: string;
  label: string;
};

type WorkspaceTabNavProps = {
  tabs: readonly WorkspaceTabItem[];
  activeTab: string;
  /** Return the navigable href for a tab id (URL-based navigation). */
  hrefForTab: (tabId: string) => string;
  className?: string;
};

/**
 * Reusable horizontal tab strip for workspace surfaces.
 * Uses Links so selection is URL/history driven (refresh + deep-link safe).
 * Scrolls on narrow viewports; matches RIVA dashboard chrome.
 */
export function WorkspaceTabNav({
  tabs,
  activeTab,
  hrefForTab,
  className,
}: WorkspaceTabNavProps) {
  return (
    <div className={cn("-mx-1 overflow-x-auto px-1 pb-1", className)}>
      <nav
        aria-label={uiZh.workspaceSections}
        className="flex h-auto min-w-full w-max justify-start gap-0 border-b border-white/[0.08]"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <Link
              key={tab.id}
              href={hrefForTab(tab.id)}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex h-9 shrink-0 items-center justify-center border-0 bg-transparent px-3 text-xs whitespace-nowrap transition-colors",
                active
                  ? "text-white after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-white"
                  : "text-white/45 hover:text-white/80",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
