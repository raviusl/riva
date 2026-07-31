"use client";

import { useRouter } from "next/navigation";
import {
  BellIcon,
  CalendarIcon,
  CheckCheckIcon,
  ClipboardListIcon,
  FileTextIcon,
  FolderKanbanIcon,
  HandshakeIcon,
  ReceiptIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";

import { uiZh } from "@/config/ui-zh";
import type { NotificationCenterKind } from "@/features/notification-center/kinds";
import {
  useNotificationCenter,
  type NotificationCenterViewItem,
} from "@/features/notification-center/notification-center-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  brandIconButtonClassName,
  brandIconSizeClassName,
} from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

function kindIcon(kind: NotificationCenterKind) {
  switch (kind) {
    case "task_assigned":
    case "task_due_today":
    case "task_overdue":
      return ClipboardListIcon;
    case "meeting_reminder":
    case "meeting_updated":
    case "calendar":
      return CalendarIcon;
    case "client_created":
      return UsersIcon;
    case "vendor_assigned":
      return HandshakeIcon;
    case "project_updated":
      return FolderKanbanIcon;
    case "invoice":
      return ReceiptIcon;
    case "documents":
      return FileTextIcon;
    default:
      return BellIcon;
  }
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const delta = Math.max(0, now - then);
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return new Date(iso).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function NotificationRow({
  item,
  onOpen,
}: {
  item: NotificationCenterViewItem;
  onOpen: (item: NotificationCenterViewItem) => void;
}) {
  const Icon = kindIcon(item.kind);
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={cn(
        "flex w-full gap-3 rounded-xl px-3 py-3 text-left transition duration-150 ease-[var(--riva-ease)]",
        item.isRead
          ? "text-white/70 hover:bg-white/[0.04]"
          : "bg-white/[0.04] text-white hover:bg-white/[0.07]",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08]",
          item.isRead ? "bg-white/[0.02] text-white/35" : "bg-white/[0.06] text-white/70",
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="truncate text-sm font-medium tracking-tight">
            {item.title}
          </span>
          <span
            className={cn(
              "mt-0.5 size-1.5 shrink-0 rounded-full",
              item.isRead ? "bg-transparent" : "bg-white/80",
            )}
            aria-label={
              item.isRead
                ? uiZh.notificationStatusRead
                : uiZh.notificationStatusUnread
            }
          />
        </span>
        <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-white/40">
          {item.message}
        </span>
        <span className="mt-1.5 flex items-center gap-2 text-[11px] text-white/30">
          <span>{formatRelativeTime(item.createdAt)}</span>
          <span>·</span>
          <span>
            {item.isRead
              ? uiZh.notificationStatusRead
              : uiZh.notificationStatusUnread}
          </span>
        </span>
      </span>
    </button>
  );
}

export function NotificationCenterTrigger() {
  const router = useRouter();
  const {
    open,
    setOpen,
    items,
    unreadCount,
    pending,
    error,
    markRead,
    markAllRead,
    clearRead,
  } = useNotificationCenter();

  function openItem(item: NotificationCenterViewItem) {
    markRead(item.id);
    setOpen(false);
    if (item.href) {
      router.push(item.href);
    }
  }

  const unreadItems = items.filter((item) => !item.isRead);
  const readItems = items.filter((item) => item.isRead);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(brandIconButtonClassName, "relative")}
        aria-label={uiZh.notifications}
      >
        <BellIcon className={brandIconSizeClassName} />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold leading-none text-black">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="riva-glass w-[min(100vw-1.5rem,380px)] border-white/[0.08] bg-[rgba(18,18,20,0.88)] p-0 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-4 py-3.5">
          <div>
            <p className="text-sm font-semibold tracking-tight">
              {uiZh.notificationCenter}
            </p>
            <p className="mt-0.5 text-xs text-white/35">
              {uiZh.notificationCenterDesc}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-white/45 transition hover:bg-white/[0.05] hover:text-white/80 disabled:opacity-30"
              onClick={markAllRead}
              disabled={unreadItems.length === 0}
            >
              <CheckCheckIcon className="size-3" />
              {uiZh.notificationMarkAllRead}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-white/45 transition hover:bg-white/[0.05] hover:text-white/80 disabled:opacity-30"
              onClick={clearRead}
              disabled={readItems.length === 0}
            >
              <Trash2Icon className="size-3" />
              {uiZh.notificationClearRead}
            </button>
          </div>
        </div>

        <div className="max-h-[min(420px,60vh)] overflow-y-auto px-2 py-2">
          {pending && items.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-white/35">
              {uiZh.loading}
            </p>
          ) : null}

          {error ? (
            <p className="px-3 py-10 text-center text-sm text-red-300/80">
              {error}
            </p>
          ) : null}

          {!error && !pending && items.length === 0 ? (
            <div className="px-3 py-10 text-center">
              <p className="text-sm text-white/55">{uiZh.notificationEmpty}</p>
              <p className="mt-1 text-xs text-white/30">
                {uiZh.notificationEmptyDesc}
              </p>
            </div>
          ) : null}

          {unreadItems.length > 0 ? (
            <section className="mb-2">
              <p className="px-3 pb-1.5 pt-2 text-[11px] font-medium tracking-[0.12em] text-white/30 uppercase">
                {uiZh.notificationUnread}
              </p>
              <ul>
                {unreadItems.map((item) => (
                  <li key={item.id}>
                    <NotificationRow item={item} onOpen={openItem} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {readItems.length > 0 ? (
            <section className="mb-1">
              <p className="px-3 pb-1.5 pt-2 text-[11px] font-medium tracking-[0.12em] text-white/30 uppercase">
                {uiZh.notificationRead}
              </p>
              <ul>
                {readItems.map((item) => (
                  <li key={item.id}>
                    <NotificationRow item={item} onOpen={openItem} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
