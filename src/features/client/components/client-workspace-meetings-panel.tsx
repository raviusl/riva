import Link from "next/link";

import type { MeetingWorkspaceModel } from "@/features/meeting/lib/meeting-types";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type ClientWorkspaceMeetingsPanelProps = {
  meetings: MeetingWorkspaceModel[];
};

function formatWindow(startsAt: string, endsAt: string | null) {
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;
  const date = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
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
  return endTime ? `${date} · ${startTime} – ${endTime}` : `${date} · ${startTime}`;
}

export function ClientWorkspaceMeetingsPanel({
  meetings,
}: ClientWorkspaceMeetingsPanelProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.relatedMeetings}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.meetingsLinkedToClient}
        </p>
      </div>

      {meetings.length === 0 ? (
        <p className="mt-4 text-sm text-white/45">{uiZh.noRelatedMeetings}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {meetings.map((meeting) => (
            <li
              key={meeting.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{meeting.title}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {formatWindow(meeting.startsAt, meeting.endsAt)}
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
    </section>
  );
}
