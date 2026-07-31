"use client";

import { formatDistanceToNow } from "date-fns";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { DocumentActivityItem } from "@/features/document/lib/document-types";
import { uiZh } from "@/config/ui-zh";

type DocumentWorkspaceActivityPanelProps = {
  activities: DocumentActivityItem[];
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

/**
 * Activity Timeline for Document Workspace.
 * Same feed pattern as Task Workspace Activity (avatar · actor · message · time).
 */
export function DocumentWorkspaceActivityPanel({
  activities,
}: DocumentWorkspaceActivityPanelProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.activity}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.documentHistoryDesc}
        </p>
      </div>

      {activities.length === 0 ? (
        <p className="mt-6 text-sm text-white/45">{uiZh.noActivityYet}</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {activities.map((activity) => {
            const name = activity.actorLabel?.trim() || uiZh.unknown;
            return (
              <li
                key={activity.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <Avatar size="sm" className="bg-white/10 text-white">
                    <AvatarFallback className="bg-white/10 text-[10px] text-white/80">
                      {initials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <p className="text-sm text-white">{name}</p>
                      <p className="text-[11px] text-white/35">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-white/70">
                      {activity.message}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
