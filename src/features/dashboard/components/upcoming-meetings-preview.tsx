import Link from "next/link";

import { DashboardSection } from "@/features/dashboard/components/dashboard-section";
import type { MeetingWorkspaceModel } from "@/features/meeting/lib/meeting-types";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type UpcomingMeetingsPreviewProps = {
  meetings: MeetingWorkspaceModel[];
};

function formatMeetingWindow(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const date = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const startTime = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} · ${startTime} – ${endTime}`;
}

export function UpcomingMeetingsPreview({
  meetings,
}: UpcomingMeetingsPreviewProps) {
  return (
    <DashboardSection
      title={uiZh.upcomingMeetingsTitle}
      description={uiZh.companySchedule}
      actionHref="/dashboard/meetings"
      actionLabel={uiZh.meetingsArrow}
    >
      {meetings.length === 0 ? (
        <p className="text-sm text-white/45">{uiZh.noUpcomingMeetings}</p>
      ) : (
        <ul className="space-y-2">
          {meetings.map((meeting) => (
            <li
              key={meeting.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{meeting.title}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {formatMeetingWindow(
                      meeting.startsAt,
                      meeting.endsAt ?? meeting.startsAt,
                    )}
                    {meeting.location ? ` · ${meeting.location}` : ""}
                  </p>
                </div>
                <Link
                  href={buildWorkspaceOverviewHref("meeting", meeting.id)}
                  className="shrink-0 text-xs text-white/45 hover:text-white/70"
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  );
}
