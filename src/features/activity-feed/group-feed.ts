/**
 * Group Activity Feed items into Today / Yesterday / Earlier.
 */

import type { ActivityTimeGroup } from "@/features/activity-feed/kinds";
import type {
  ActivityFeedGroup,
  ActivityFeedItem,
} from "@/features/activity-feed/types";
import { uiZh } from "@/config/ui-zh";

function dayKey(iso: string, now: Date): string {
  // Compare on local calendar days
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function localDayKey(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function yesterdayKey(now: Date): string {
  const d = new Date(now);
  d.setDate(d.getDate() - 1);
  return localDayKey(d);
}

export function resolveActivityTimeGroup(
  timestamp: string,
  now = new Date(),
): ActivityTimeGroup {
  const key = dayKey(timestamp, now);
  if (key === localDayKey(now)) return "today";
  if (key === yesterdayKey(now)) return "yesterday";
  return "earlier";
}

export function groupActivityFeed(
  items: readonly ActivityFeedItem[],
  now = new Date(),
): ActivityFeedGroup[] {
  const buckets: Record<ActivityTimeGroup, ActivityFeedItem[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  };

  for (const item of items) {
    buckets[resolveActivityTimeGroup(item.timestamp, now)].push(item);
  }

  const labels: Record<ActivityTimeGroup, string> = {
    today: uiZh.activityGroupToday,
    yesterday: uiZh.activityGroupYesterday,
    earlier: uiZh.activityGroupEarlier,
  };

  return (["today", "yesterday", "earlier"] as const)
    .map((id) => ({
      id,
      label: labels[id],
      items: buckets[id],
    }))
    .filter((group) => group.items.length > 0);
}
