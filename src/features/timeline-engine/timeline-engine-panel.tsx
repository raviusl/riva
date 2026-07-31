"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleSlashIcon,
  ListTodoIcon,
  UsersIcon,
} from "lucide-react";

import { loadProjectTimelineAction } from "@/core/actions/timeline-engine-actions";
import { uiZh } from "@/config/ui-zh";
import { formatMilestoneStatus } from "@/features/timeline-engine/labels";
import {
  emptyTimelineLocalState,
  patchMilestoneOverride,
  readTimelineLocalState,
  writeTimelineLocalState,
  type ProjectTimelineLocalState,
} from "@/features/timeline-engine/local-state";
import type { TimelineMilestoneStatus } from "@/features/timeline-engine/status";
import type {
  ProjectTimelineEngine,
  TimelineMilestoneItem,
} from "@/features/timeline-engine/types";
import {
  brandCaptionClassName,
  brandGlassPanelClassName,
  brandLabelClassName,
} from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

type ProjectTimelineEnginePanelProps = {
  workspaceId: string;
  companyId: string;
  projectId: string;
  className?: string;
};

function statusIcon(status: TimelineMilestoneStatus) {
  switch (status) {
    case "completed":
      return CheckCircle2Icon;
    case "active":
      return CircleDotIcon;
    case "skipped":
      return CircleSlashIcon;
    default:
      return CircleDashedIcon;
  }
}

function statusTone(status: TimelineMilestoneStatus) {
  switch (status) {
    case "completed":
      return "text-emerald-300/90 border-emerald-400/25 bg-emerald-400/10";
    case "active":
      return "text-white border-white/20 bg-white/10";
    case "skipped":
      return "text-white/35 border-white/10 bg-white/[0.03]";
    default:
      return "text-white/55 border-white/10 bg-white/[0.04]";
  }
}

function formatDate(value: string | null) {
  if (!value) return uiZh.emDash;
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
  } catch {
    return value.slice(0, 10);
  }
}

function MilestoneCard({
  milestone,
  canWrite,
  expanded,
  onToggle,
  onStatusChange,
}: {
  milestone: TimelineMilestoneItem;
  canWrite: boolean;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: TimelineMilestoneStatus) => void;
}) {
  const Icon = statusIcon(milestone.status);

  return (
    <li className="relative pl-8">
      <span
        className={cn(
          "absolute top-3 left-0 flex size-5 items-center justify-center rounded-full border",
          statusTone(milestone.status),
        )}
        aria-hidden
      >
        <Icon className="size-3" strokeWidth={1.75} />
      </span>

      <div
        className={cn(
          brandGlassPanelClassName,
          "rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-xl transition",
          milestone.status === "active" && "border-white/12 bg-white/[0.05]",
          milestone.status === "skipped" && "opacity-60",
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-start justify-between gap-3 text-left"
        >
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium tracking-tight text-white/90">
                {milestone.title}
              </h3>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] tracking-wide",
                  statusTone(milestone.status),
                )}
              >
                {formatMilestoneStatus(milestone.status)}
              </span>
            </div>
            {milestone.description ? (
              <p className={cn(brandCaptionClassName, "leading-relaxed")}>
                {milestone.description}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-white/35">
              <span>
                {uiZh.date}: {formatDate(milestone.date)}
              </span>
              <span>
                {uiZh.owner}: {milestone.ownerName ?? uiZh.emDash}
              </span>
              <span>
                {uiZh.tasks}: {milestone.relatedTasks.length}
              </span>
              <span>
                {uiZh.meetings}: {milestone.relatedMeetings.length}
              </span>
            </div>
          </div>
          <span className="shrink-0 text-xs text-white/30">
            {expanded ? uiZh.collapse : uiZh.expand}
          </span>
        </button>

        {expanded ? (
          <div className="mt-4 space-y-4 border-t border-white/[0.06] pt-4">
            {canWrite ? (
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "pending",
                    "active",
                    "completed",
                    "skipped",
                  ] as const satisfies readonly TimelineMilestoneStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onStatusChange(status)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] transition",
                      milestone.status === status
                        ? statusTone(status)
                        : "border-white/10 text-white/40 hover:border-white/16 hover:text-white/70",
                    )}
                  >
                    {formatMilestoneStatus(status)}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className={brandLabelClassName}>
                  <ListTodoIcon className="mr-1.5 inline size-3" />
                  {uiZh.relatedTasks}
                </p>
                {milestone.relatedTasks.length === 0 ? (
                  <p className={brandCaptionClassName}>{uiZh.noRelatedTasks}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {milestone.relatedTasks.map((task) => (
                      <li key={task.id}>
                        <Link
                          href={task.href}
                          className="block rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm text-white/75 transition hover:border-white/12 hover:bg-white/[0.05] hover:text-white"
                        >
                          {task.title}
                          <span className="mt-0.5 block text-[11px] text-white/30">
                            {task.status}
                            {task.dueDate
                              ? ` · ${formatDate(task.dueDate)}`
                              : ""}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <p className={brandLabelClassName}>
                  <UsersIcon className="mr-1.5 inline size-3" />
                  {uiZh.relatedMeetings}
                </p>
                {milestone.relatedMeetings.length === 0 ? (
                  <p className={brandCaptionClassName}>
                    {uiZh.noRelatedMeetings}
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {milestone.relatedMeetings.map((meeting) => (
                      <li key={meeting.id}>
                        <Link
                          href={meeting.href}
                          className="block rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm text-white/75 transition hover:border-white/12 hover:bg-white/[0.05] hover:text-white"
                        >
                          {meeting.title}
                          <span className="mt-0.5 block text-[11px] text-white/30">
                            {formatDate(meeting.startsAt)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function ProjectTimelineEnginePanel({
  workspaceId,
  companyId,
  projectId,
  className,
}: ProjectTimelineEnginePanelProps) {
  const [base, setBase] = useState<ProjectTimelineEngine | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [local, setLocal] = useState<ProjectTimelineLocalState>(
    emptyTimelineLocalState,
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setLocal(readTimelineLocalState(companyId, projectId));
  }, [companyId, projectId]);

  useEffect(() => {
    let cancelled = false;
    startTransition(async () => {
      const result = await loadProjectTimelineAction({
        workspaceId,
        companyId,
        projectId,
      });
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error);
        setBase(null);
        return;
      }
      setError(null);
      setBase(result.data.timeline);
      setCanWrite(result.data.canWrite);
      const firstActive = result.data.timeline.milestones.find(
        (m) => m.status === "active",
      );
      setExpandedId((prev) => prev ?? firstActive?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, companyId, projectId]);

  const timeline = useMemo(() => {
    if (!base) return null;
    // Re-apply local overrides + related entity buckets from server base
    // by reconstructing from milestone overrides only (related lists stay).
    const rebuiltStatuses = base.milestones.map((m) => {
      const override = local.overrides[m.id];
      if (!override) return m;
      return {
        ...m,
        title: override.title ?? m.title,
        description:
          override.description !== undefined
            ? override.description
            : m.description,
        date: override.date !== undefined ? override.date : m.date,
        status: override.status ?? m.status,
        ownerId: override.ownerId !== undefined ? override.ownerId : m.ownerId,
      };
    });

    const completedCount = rebuiltStatuses.filter(
      (m) => m.status === "completed",
    ).length;
    const totalCount = rebuiltStatuses.length;
    const progressPercent =
      totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return {
      ...base,
      milestones: rebuiltStatuses,
      completedCount,
      totalCount,
      progressPercent,
    } satisfies ProjectTimelineEngine;
  }, [base, local]);

  const onStatusChange = useCallback(
    (milestoneId: string, status: TimelineMilestoneStatus) => {
      setLocal((prev) => {
        let next = patchMilestoneOverride(prev, milestoneId, { status });
        // Keep a single Active milestone when promoting.
        if (status === "active" && base) {
          for (const m of base.milestones) {
            if (m.id === milestoneId) continue;
            const current =
              next.overrides[m.id]?.status ??
              base.milestones.find((x) => x.id === m.id)?.status;
            if (current === "active") {
              next = patchMilestoneOverride(next, m.id, { status: "pending" });
            }
          }
        }
        writeTimelineLocalState(companyId, projectId, next);
        return next;
      });
    },
    [base, companyId, projectId],
  );

  if (error) {
    return (
      <div
        className={cn(
          brandGlassPanelClassName,
          "rounded-2xl px-5 py-6 text-sm text-white/50",
          className,
        )}
      >
        {error}
      </div>
    );
  }

  if (!timeline) {
    return (
      <div
        className={cn(
          brandGlassPanelClassName,
          "rounded-2xl px-5 py-6 text-sm text-white/40",
          className,
        )}
      >
        {pending ? uiZh.loading : uiZh.projectTimelineSoon}
      </div>
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      <div
        className={cn(
          brandGlassPanelClassName,
          "rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl",
        )}
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={brandLabelClassName}>
              <CalendarDaysIcon className="mr-1.5 inline size-3" />
              {uiZh.timelineProgress}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {timeline.progressPercent}%
            </p>
            <p className={cn(brandCaptionClassName, "mt-1")}>
              {uiZh.timelineProgressDetail(
                timeline.completedCount,
                timeline.totalCount,
              )}
            </p>
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-white/70 transition-[width] duration-500"
            style={{ width: `${timeline.progressPercent}%` }}
          />
        </div>
      </div>

      <ol className="relative space-y-4 before:absolute before:top-3 before:bottom-3 before:left-[9px] before:w-px before:bg-white/[0.08]">
        {timeline.milestones.map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            canWrite={canWrite}
            expanded={expandedId === milestone.id}
            onToggle={() =>
              setExpandedId((id) =>
                id === milestone.id ? null : milestone.id,
              )
            }
            onStatusChange={(status) => onStatusChange(milestone.id, status)}
          />
        ))}
      </ol>
    </div>
  );
}
