"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  BellIcon,
  Building2Icon,
  CalendarDaysIcon,
  CircleDotIcon,
  FolderKanbanIcon,
  ListTodoIcon,
  UsersIcon,
} from "lucide-react";

import { loadActivityFeedAction } from "@/core/actions/activity-feed-actions";
import { uiZh } from "@/config/ui-zh";
import type { ActivityFilter } from "@/features/activity-feed/kinds";
import {
  formatActivityEntity,
  formatActivityFilter,
} from "@/features/activity-feed/labels";
import type {
  ActivityFeedGroup,
  ActivityFeedItem,
} from "@/features/activity-feed/types";
import {
  brandCaptionClassName,
  brandGlassPanelClassName,
  brandLabelClassName,
  brandTitleClassName,
} from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

type ActivityFeedPanelProps = {
  workspaceId: string;
  companyId: string;
  /** Compact mode for dashboard previews. */
  compact?: boolean;
  initialLimit?: number;
};

function entityIcon(entity: ActivityFeedItem["entity"]) {
  switch (entity) {
    case "project":
      return FolderKanbanIcon;
    case "client":
      return UsersIcon;
    case "vendor":
      return Building2Icon;
    case "meeting":
      return CalendarDaysIcon;
    case "task":
      return ListTodoIcon;
    case "timeline":
      return CircleDotIcon;
    case "notification":
      return BellIcon;
    default:
      return CircleDotIcon;
  }
}

function formatStamp(iso: string) {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 16);
  }
}

function ActivityRow({ item }: { item: ActivityFeedItem }) {
  const Icon = entityIcon(item.entity);
  const body = (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/50">
        <Icon className="size-3.5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm tracking-tight text-white/85">{item.title}</p>
        <p className={cn(brandCaptionClassName, "mt-0.5 line-clamp-2")}>
          {item.description}
        </p>
        <p className="mt-1 text-[11px] text-white/30">
          {formatActivityEntity(item.entity)}
          {" · "}
          {formatStamp(item.timestamp)}
          {item.userLabel ? ` · ${item.userLabel}` : ""}
        </p>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="block rounded-2xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-3 transition hover:border-white/12 hover:bg-white/[0.05]"
      >
        {body}
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-3">
      {body}
    </div>
  );
}

export function ActivityFeedPanel({
  workspaceId,
  companyId,
  compact = false,
  initialLimit,
}: ActivityFeedPanelProps) {
  const [groups, setGroups] = useState<ActivityFeedGroup[]>([]);
  const [availableFilters, setAvailableFilters] = useState<ActivityFilter[]>([
    "all",
  ]);
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, startTransition] = useTransition();

  const load = useCallback(
    (nextFilter: ActivityFilter) => {
      startTransition(async () => {
        const result = await loadActivityFeedAction({
          workspaceId,
          companyId,
          filter: nextFilter,
          limit: initialLimit ?? (compact ? 12 : 80),
          includePlaceholders: !compact,
        });
        if (!result.ok) {
          setError(result.error);
          setLoaded(true);
          return;
        }
        setError(null);
        setGroups(result.data.groups);
        setAvailableFilters(result.data.availableFilters);
        setLoaded(true);
      });
    },
    [workspaceId, companyId, initialLimit, compact],
  );

  useEffect(() => {
    load(filter);
  }, [load, filter]);

  const empty = useMemo(
    () => groups.every((g) => g.items.length === 0),
    [groups],
  );

  if (!loaded) {
    return (
      <div
        className={cn(
          brandGlassPanelClassName,
          "rounded-2xl px-5 py-8 text-sm text-white/40",
        )}
      >
        {pending ? uiZh.loading : uiZh.activityFeedDesc}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          brandGlassPanelClassName,
          "rounded-2xl px-5 py-8 text-sm text-white/50",
        )}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!compact ? (
        <header className="space-y-2">
          <p className={brandLabelClassName}>{uiZh.activityFeed}</p>
          <h1 className={brandTitleClassName}>{uiZh.activityFeedTitle}</h1>
          <p className={brandCaptionClassName}>{uiZh.activityFeedDesc}</p>
        </header>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        {availableFilters.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition",
              filter === key
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 text-white/45 hover:border-white/16 hover:text-white/75",
            )}
          >
            {formatActivityFilter(key)}
          </button>
        ))}
      </div>

      {empty ? (
        <div
          className={cn(
            brandGlassPanelClassName,
            "rounded-2xl px-5 py-8 text-sm text-white/40",
          )}
        >
          {uiZh.noRecentActivity}
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.id} className="space-y-3">
              <h2 className={brandLabelClassName}>{group.label}</h2>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
