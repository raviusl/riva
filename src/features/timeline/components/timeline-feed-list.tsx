import Link from "next/link";

import { WorkspaceEntityLink } from "@/components/layout/workspace-entity-link";
import type { TimelineFeedItem } from "@/core/timeline";
import {
  formatTimelineDateTime,
  timelineKindIcon,
  timelineStatusLabel,
} from "@/features/timeline/lib/timeline-labels";

type TimelineFeedListProps = {
  items: TimelineFeedItem[];
  emptyTitle: string;
  emptyDescription: string;
};

export function TimelineFeedList({
  items,
  emptyTitle,
  emptyDescription,
}: TimelineFeedListProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center">
        <p className="text-sm font-medium text-white/80">{emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/45">
          {emptyDescription}
        </p>
      </section>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-medium text-white/70"
            >
              {timelineKindIcon(item.kind)}
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link
                  href={item.href}
                  className="text-sm text-white transition-colors hover:text-white/80"
                >
                  {item.title}
                </Link>
                <time className="text-[11px] text-white/35">
                  {formatTimelineDateTime(item.occurredAt)}
                </time>
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/45">
                <span>{item.entityLabel}</span>
                <span>{timelineStatusLabel(item.status)}</span>
                <Link
                  href={item.href}
                  className="text-white/55 transition-colors hover:text-white/80"
                >
                  Open source
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                <span>
                  Project:{" "}
                  {item.relatedProjectId && item.relatedProjectName ? (
                    <WorkspaceEntityLink
                      kind="project"
                      id={item.relatedProjectId}
                      className="text-white/70 hover:text-white"
                    >
                      {item.relatedProjectName}
                    </WorkspaceEntityLink>
                  ) : (
                    "—"
                  )}
                </span>
                <span>
                  Client:{" "}
                  {item.relatedClientId && item.relatedClientName ? (
                    <WorkspaceEntityLink
                      kind="client"
                      id={item.relatedClientId}
                      className="text-white/70 hover:text-white"
                    >
                      {item.relatedClientName}
                    </WorkspaceEntityLink>
                  ) : (
                    "—"
                  )}
                </span>
                <span>
                  Vendor:{" "}
                  {item.relatedVendorId && item.relatedVendorName ? (
                    <WorkspaceEntityLink
                      kind="vendor"
                      id={item.relatedVendorId}
                      className="text-white/70 hover:text-white"
                    >
                      {item.relatedVendorName}
                    </WorkspaceEntityLink>
                  ) : (
                    "—"
                  )}
                </span>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
