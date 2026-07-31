"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { SidebarNav } from "@/components/layout/resolve-sidebar-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { navItems } from "@/config/i18n";
import { uiZh } from "@/config/ui-zh";
import { cn } from "@/lib/utils";

export function AppSidebar({
  businessName = null,
  items = navItems,
}: {
  businessName?: string | null;
  items?: SidebarNav;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-svh w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0b]/95 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-white text-[11px] font-semibold tracking-tight text-black">
          R
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-white">
            {uiZh.appName}
          </p>
          <p className="truncate text-[11px] text-white/40">
            {businessName ?? uiZh.appName}
          </p>
        </div>
      </div>

      <Separator className="bg-white/[0.06]" />

      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-white/55 hover:bg-white/[0.04] hover:text-white/90",
                )}
              >
                <span className="mt-0.5 text-[15px] leading-none" aria-hidden>
                  {item.emoji}
                </span>
                <span
                  className={cn(
                    "leading-snug",
                    active ? "text-white" : "text-white/80 group-hover:text-white",
                  )}
                >
                  {item.label.zh}
                </span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
