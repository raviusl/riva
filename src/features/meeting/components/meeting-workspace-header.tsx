"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  WorkspaceHeader,
  type WorkspaceHeaderStatus,
} from "@/components/layout/workspace-header";
import { uiZh } from "@/config/ui-zh";
import {
  cancelMeetingAction,
  completeMeetingAction,
} from "@/core/actions/meeting-actions";
import {
  meetingStatusLabel,
  meetingTypeLabel,
} from "@/features/meeting/lib/meeting-labels";
import type { MeetingWorkspaceModel } from "@/features/meeting/lib/meeting-types";
import { buildWorkspaceBreadcrumbs } from "@/lib/workspace/cross-navigation";

type MeetingWorkspaceHeaderProps = {
  workspaceId: string;
  companyId: string;
  meeting: MeetingWorkspaceModel;
  canWrite: boolean;
};

function meetingStatusTone(
  status: MeetingWorkspaceModel["status"],
): WorkspaceHeaderStatus["tone"] {
  switch (status) {
    case "scheduled":
    case "confirmed":
      return "info";
    case "completed":
      return "success";
    case "no_show":
      return "warning";
    case "cancelled":
    default:
      return "default";
  }
}

function formatWhen(meeting: MeetingWorkspaceModel) {
  const start = new Date(meeting.startsAt);
  const end = meeting.endsAt ? new Date(meeting.endsAt) : null;
  const date = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const startTime = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const endTime = end
    ? end.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;
  return endTime
    ? `${date} · ${startTime} – ${endTime}`
    : `${date} · ${startTime}`;
}

export function MeetingWorkspaceHeader({
  workspaceId,
  companyId,
  meeting,
  canWrite,
}: MeetingWorkspaceHeaderProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const cancellable =
    meeting.status === "scheduled" || meeting.status === "confirmed";

  return (
    <div className="space-y-4">
      <WorkspaceHeader
        eyebrow={uiZh.meetingWorkspace}
        title={meeting.title}
        status={{
          label: meetingStatusLabel(meeting.status),
          tone: meetingStatusTone(meeting.status),
        }}
        lifecycle={`${meetingTypeLabel(meeting.meetingType)} · ${formatWhen(meeting)}`}
        breadcrumbs={buildWorkspaceBreadcrumbs("meeting")}
      />

      {canWrite ? (
        <div className="flex flex-wrap gap-2">
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
                {uiZh.cancelMeeting}
              </Button>
            </>
          ) : null}
          <Link
            href="/dashboard/meetings"
            className="inline-flex h-8 items-center rounded-lg border border-white/10 px-3 text-xs text-white/55 hover:text-white/80"
          >
            {uiZh.allMeetings}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
