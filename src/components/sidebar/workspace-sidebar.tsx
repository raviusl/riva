"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  isWorkspaceNavActive,
  WORKSPACE_NAV_ITEMS,
  type WorkspaceNavItem,
} from "@/components/sidebar/nav-items";
import { cn } from "@/lib/utils";

type WorkspaceSidebarProps = {
  businessName?: string | null;
  collapsed?: boolean;
  items?: readonly WorkspaceNavItem[];
  className?: string;
};

export function WorkspaceSidebar({
  collapsed = false,
  items = WORKSPACE_NAV_ITEMS,
  className,
}: WorkspaceSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "riva-glass flex h-svh shrink-0 flex-col border-r border-white/[0.06] transition-[width] duration-200 ease-[var(--riva-ease)]",
        collapsed ? "w-[72px]" : "w-[248px]",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-3",
          collapsed ? "justify-center px-2" : "px-5",
        )}
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-white text-[11px] font-semibold tracking-tight text-black">
          R
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-white">
              RIVA OS
            </p>
          </div>
        ) : null}
      </div>

      <div className="mx-4 h-px bg-white/[0.06]" />

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {items.map((item) => {
          const active = isWorkspaceNavActive(pathname, item);
          return (
            <Link
              key={item.id}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "rounded-xl px-3 py-2.5 text-[13px] font-medium tracking-tight transition duration-200 ease-[var(--riva-ease)]",
                collapsed && "flex justify-center px-2",
                active
                  ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/90",
              )}
            >
              {collapsed ? item.label.charAt(0) : item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
