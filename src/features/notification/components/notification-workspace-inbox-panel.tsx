"use client";

import { useMemo, useState } from "react";

import type {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from "@/core/notification";
import type { NotificationWorkspaceItem } from "@/features/notification/lib/notification-types";
import {
  formatNotificationDateTime,
  notificationChannelLabel,
  notificationPriorityLabel,
  notificationStatusLabel,
  notificationTypeLabel,
} from "@/features/notification/lib/notification-labels";
import { uiZh } from "@/config/ui-zh";

type NotificationWorkspaceInboxPanelProps = {
  notifications: NotificationWorkspaceItem[];
};

type SortKey = "title" | "priority" | "sentAt" | "status";

const STATUS_FILTERS: Array<{ id: "all" | NotificationStatus; label: string }> =
  [
    { id: "all", label: uiZh.allStatuses },
    { id: "delivered", label: uiZh.delivered },
    { id: "sent", label: uiZh.sent },
    { id: "read", label: uiZh.readStatus },
    { id: "failed", label: uiZh.failed },
    { id: "queued", label: uiZh.queued },
    { id: "pending", label: uiZh.pending },
  ];

const TYPE_FILTERS: Array<{ id: "all" | NotificationType; label: string }> = [
  { id: "all", label: uiZh.allTypes },
  { id: "task", label: uiZh.taskSingular },
  { id: "meeting", label: uiZh.meetings },
  { id: "finance", label: uiZh.finance },
  { id: "document", label: uiZh.document },
  { id: "project", label: uiZh.projects },
  { id: "reminder", label: uiZh.reminder },
  { id: "announcement", label: uiZh.announcement },
];

const CHANNEL_FILTERS: Array<{
  id: "all" | NotificationChannel;
  label: string;
}> = [
  { id: "all", label: uiZh.allChannels },
  { id: "in_app", label: uiZh.channelInAppShort },
  { id: "email", label: uiZh.email },
  { id: "sms", label: uiZh.channelSms },
  { id: "whatsapp", label: uiZh.channelWhatsapp },
  { id: "push", label: uiZh.channelPush },
];

const PRIORITY_ORDER: Record<NotificationPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function NotificationWorkspaceInboxPanel({
  notifications,
}: NotificationWorkspaceInboxPanelProps) {
  const [rows, setRows] = useState(notifications);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]["id"]>("all");
  const [typeFilter, setTypeFilter] =
    useState<(typeof TYPE_FILTERS)[number]["id"]>("all");
  const [channelFilter, setChannelFilter] =
    useState<(typeof CHANNEL_FILTERS)[number]["id"]>("all");
  const [sortKey, setSortKey] = useState<SortKey>("sentAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const next = rows.filter((row) => {
      const matchesSearch =
        !query ||
        row.title.toLowerCase().includes(query) ||
        row.message.toLowerCase().includes(query) ||
        (row.recipientLabel ?? "").toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" || row.status === statusFilter;
      const matchesType = typeFilter === "all" || row.type === typeFilter;
      const matchesChannel =
        channelFilter === "all" || row.channel === channelFilter;
      return matchesSearch && matchesStatus && matchesType && matchesChannel;
    });

    next.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "priority":
          cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "sentAt":
          cmp = (a.sentAt ?? a.createdAt).localeCompare(
            b.sentAt ?? b.createdAt,
          );
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return next;
  }, [channelFilter, rows, search, sortDir, sortKey, statusFilter, typeFilter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "title" ? "asc" : "desc");
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  function markRead(id: string) {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              status: "read",
              readAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : row,
      ),
    );
  }

  function markUnread(id: string) {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              status: row.sentAt ? "delivered" : "pending",
              readAt: null,
              updatedAt: new Date().toISOString(),
            }
          : row,
      ),
    );
  }

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.inbox}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.inboxPanelDesc}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={uiZh.searchNotifications}
          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none sm:max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as (typeof STATUS_FILTERS)[number]["id"],
            )
          }
          className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-white/25 focus:outline-none"
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(
              event.target.value as (typeof TYPE_FILTERS)[number]["id"],
            )
          }
          className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-white/25 focus:outline-none"
        >
          {TYPE_FILTERS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={channelFilter}
          onChange={(event) =>
            setChannelFilter(
              event.target.value as (typeof CHANNEL_FILTERS)[number]["id"],
            )
          }
          className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-white/25 focus:outline-none"
        >
          {CHANNEL_FILTERS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-white/45">{uiZh.noNotificationsMatch}</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-white/40">
                <th className="pb-2 pr-3 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("title")}
                    className="hover:text-white/70"
                  >
                    {uiZh.titleLabel}{sortIndicator("title")}
                  </button>
                </th>
                <th className="pb-2 pr-3 font-medium">{uiZh.type}</th>
                <th className="pb-2 pr-3 font-medium">{uiZh.channel}</th>
                <th className="pb-2 pr-3 font-medium">{uiZh.recipient}</th>
                <th className="pb-2 pr-3 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("status")}
                    className="hover:text-white/70"
                  >
                    {uiZh.status}{sortIndicator("status")}
                  </button>
                </th>
                <th className="pb-2 pr-3 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("priority")}
                    className="hover:text-white/70"
                  >
                    {uiZh.priority}{sortIndicator("priority")}
                  </button>
                </th>
                <th className="pb-2 pr-3 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("sentAt")}
                    className="hover:text-white/70"
                  >
                    {uiZh.sentAt}{sortIndicator("sentAt")}
                  </button>
                </th>
                <th className="pb-2 font-medium">{uiZh.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const isRead = row.status === "read" || Boolean(row.readAt);
                return (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.06] text-white/80"
                  >
                    <td className="py-3 pr-3 text-white">{row.title}</td>
                    <td className="py-3 pr-3 text-xs text-white/55">
                      {notificationTypeLabel(row.type)}
                    </td>
                    <td className="py-3 pr-3 text-xs text-white/55">
                      {notificationChannelLabel(row.channel)}
                    </td>
                    <td className="py-3 pr-3 text-xs text-white/55">
                      {row.recipientLabel ?? "—"}
                    </td>
                    <td className="py-3 pr-3 text-xs text-white/55">
                      {notificationStatusLabel(row.status)}
                    </td>
                    <td className="py-3 pr-3 text-xs text-white/55">
                      {notificationPriorityLabel(row.priority)}
                    </td>
                    <td className="py-3 pr-3 text-xs text-white/55">
                      {formatNotificationDateTime(row.sentAt)}
                    </td>
                    <td className="py-3 text-xs">
                      {isRead ? (
                        <button
                          type="button"
                          onClick={() => markUnread(row.id)}
                          className="text-white/55 hover:text-white"
                        >
                          {uiZh.markUnread}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markRead(row.id)}
                          className="text-white/55 hover:text-white"
                        >
                          {uiZh.markRead}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
