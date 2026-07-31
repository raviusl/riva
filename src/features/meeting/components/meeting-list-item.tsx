"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uiZh } from "@/config/ui-zh";
import {
  cancelMeetingAction,
  completeMeetingAction,
} from "@/core/actions/meeting-actions";
import type { Meeting } from "@/core/meeting/types";
import {
  meetingStatusLabel,
  meetingTypeLabel,
} from "@/features/meeting/lib/meeting-labels";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

type MeetingListItemProps = {
  workspaceId: string;
  companyId: string;
  meeting: Meeting;
  canWrite: boolean;
  projectName?: string | null;
  clientName?: string | null;
  ownerName?: string | null;
};

function formatWhen(meeting: Meeting) {
  const start = new Date(meeting.starts_at);
  const date = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} · ${time} · ${uiZh.minutesShort(meeting.duration_minutes)}`;
}

export function MeetingListItem({
  workspaceId,
  companyId,
  meeting,
  canWrite,
  projectName = null,
  clientName = null,
  ownerName = null,
}: MeetingListItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const workspaceHref = buildWorkspaceOverviewHref("meeting", meeting.id);
  const cancellable =
    meeting.status === "scheduled" || meeting.status === "confirmed";

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            href={workspaceHref}
            className="truncate text-sm font-medium text-white hover:text-white/80"
          >
            {meeting.title}
          </Link>
          <p className="mt-1 truncate text-xs text-white/45">
            {meetingTypeLabel(meeting.meeting_type)} ·{" "}
            {meetingStatusLabel(meeting.status)}
            {ownerName ? ` · ${ownerName}` : ""}
            {clientName ? ` · ${clientName}` : ""}
          </p>
          <p className="mt-1 truncate text-xs text-white/40">
            {formatWhen(meeting)}
            {meeting.location ? ` · ${meeting.location}` : ""}
          </p>
          {meeting.project_id && projectName ? (
            <Link
              href={buildWorkspaceOverviewHref("project", meeting.project_id)}
              className="mt-1 inline-block truncate text-xs text-white/40 hover:text-white/70"
            >
              {uiZh.projectPrefix} {projectName}
            </Link>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => router.push(workspaceHref)}
          >
            {uiZh.open}
          </Button>
          {canWrite ? (
            <>
              {meeting.status !== "cancelled" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    router.push(`/dashboard/meetings/${meeting.id}/edit`)
                  }
                >
                  {uiZh.edit}
                </Button>
              ) : null}
              {cancellable ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        const result = await completeMeetingAction({
                          workspaceId,
                          companyId,
                          meetingId: meeting.id,
                        });
                        if (!result.ok) {
                          toast.error(result.error);
                          return;
                        }
                        toast.success(uiZh.meetingCompletedToast);
                        router.refresh();
                      });
                    }}
                  >
                    {uiZh.completeAction}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        const result = await cancelMeetingAction({
                          workspaceId,
                          companyId,
                          meetingId: meeting.id,
                        });
                        if (!result.ok) {
                          toast.error(result.error);
                          return;
                        }
                        toast.success(uiZh.meetingCancelledToast);
                        router.refresh();
                      });
                    }}
                  >
                    {uiZh.cancel}
                  </Button>
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
