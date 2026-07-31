"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MenuIcon } from "lucide-react";

import {
  isWorkspaceNavActive,
  WORKSPACE_NAV_ITEMS,
  type WorkspaceNavItem,
} from "@/components/sidebar/nav-items";
import { brandIconButtonClassName, brandIconSizeClassName } from "@/lib/brand-ui";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { uiZh } from "@/config/ui-zh";
import { cn } from "@/lib/utils";

type MobileSidebarProps = {
  businessName?: string | null;
  items?: readonly WorkspaceNavItem[];
};

export function MobileSidebar({
  businessName = null,
  items = WORKSPACE_NAV_ITEMS,
}: MobileSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(brandIconButtonClassName, "lg:hidden")}
        aria-label={uiZh.openNavigation}
      >
        <MenuIcon className={brandIconSizeClassName} />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="riva-glass w-[280px] border-white/[0.08] p-0 text-white"
      >
        <SheetHeader className="border-b border-white/[0.06] px-5 py-5">
          <SheetTitle className="text-left text-sm font-medium text-white">
            {businessName ?? uiZh.appName}
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => {
            const active = isWorkspaceNavActive(pathname, item);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-[13px] font-medium tracking-tight transition duration-200 ease-[var(--riva-ease)]",
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white/90",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
