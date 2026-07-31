import type { ReactNode } from "react";

import { WorkspaceEntityLink } from "@/components/layout/workspace-entity-link";
import { uiZh } from "@/config/ui-zh";
import {
  meetingStatusLabel,
  meetingTypeLabel,
} from "@/features/meeting/lib/meeting-labels";
import type { MeetingWorkspaceModel } from "@/features/meeting/lib/meeting-types";

type MeetingWorkspaceOverviewProps = {
  meeting: MeetingWorkspaceModel;
};

function formatDateTime(value: string | null) {
  if (!value) return uiZh.emDash;
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:items-baseline">
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="break-words text-sm text-white/80">{value}</dd>
    </div>
  );
}

export function MeetingWorkspaceOverview({
  meeting,
}: MeetingWorkspaceOverviewProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <div>
          <h2 className="text-sm font-medium text-white">
            {uiZh.meetingDetails}
          </h2>
          <p className="mt-1 text-xs text-white/45">{uiZh.meetingDetailsDesc}</p>
        </div>

        <dl className="mt-5 space-y-4">
          <InfoRow label={uiZh.titleLabel} value={meeting.title} />
          <InfoRow
            label={uiZh.type}
            value={meetingTypeLabel(meeting.meetingType)}
          />
          <InfoRow
            label={uiZh.status}
            value={meetingStatusLabel(meeting.status)}
          />
          <InfoRow label={uiZh.date} value={meeting.meetingDate} />
          <InfoRow label={uiZh.time} value={meeting.meetingTime} />
          <InfoRow
            label={uiZh.durationMinutes}
            value={uiZh.minutesShort(meeting.durationMinutes)}
          />
          <InfoRow
            label={uiZh.starts}
            value={formatDateTime(meeting.startsAt)}
          />
          <InfoRow label={uiZh.ends} value={formatDateTime(meeting.endsAt)} />
          <InfoRow
            label={uiZh.location}
            value={meeting.location?.trim() || uiZh.emDash}
          />
          <InfoRow
            label={uiZh.googleMeet}
            value={
              meeting.googleMeetLink ? (
                <a
                  href={meeting.googleMeetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/80 underline-offset-2 hover:underline"
                >
                  {meeting.googleMeetLink}
                </a>
              ) : (
                uiZh.emDash
              )
            }
          />
          <InfoRow
            label={uiZh.owner}
            value={meeting.ownerLabel || uiZh.emDash}
          />
          <InfoRow
            label={uiZh.projects}
            value={
              meeting.projectId && meeting.projectName ? (
                <WorkspaceEntityLink kind="project" id={meeting.projectId}>
                  {meeting.projectName}
                </WorkspaceEntityLink>
              ) : (
                meeting.projectName || uiZh.emDash
              )
            }
          />
          <InfoRow
            label={uiZh.client}
            value={
              meeting.clientId && meeting.clientName ? (
                <WorkspaceEntityLink kind="client" id={meeting.clientId}>
                  {meeting.clientName}
                </WorkspaceEntityLink>
              ) : (
                meeting.clientName || uiZh.emDash
              )
            }
          />
          <InfoRow
            label={uiZh.vendors}
            value={
              meeting.vendorIds.length > 0 ? (
                <ul className="space-y-1">
                  {meeting.vendorIds.map((vendorId, index) => (
                    <li key={vendorId}>
                      <WorkspaceEntityLink kind="vendor" id={vendorId}>
                        {meeting.vendorNames[index] ?? vendorId.slice(0, 8)}
                      </WorkspaceEntityLink>
                    </li>
                  ))}
                </ul>
              ) : (
                uiZh.emDash
              )
            }
          />
        </dl>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <h2 className="text-sm font-medium text-white">
          {uiZh.participantsCount(meeting.participants.length)}
        </h2>
        <p className="mt-1 text-xs text-white/45">{uiZh.participantsDesc}</p>

        {meeting.participants.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">
            {uiZh.noParticipantsListed}
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {meeting.participants.map((participant) => (
              <li
                key={participant.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <p className="text-sm text-white">{participant.name}</p>
                <p className="mt-1 text-xs text-white/40">
                  {[participant.role, participant.email]
                    .filter(Boolean)
                    .join(" · ") || uiZh.participantFallback}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <h2 className="text-sm font-medium text-white">{uiZh.notes}</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">
          {meeting.notes.trim() || uiZh.emDash}
        </p>
        <h2 className="mt-5 text-sm font-medium text-white">
          {uiZh.internalNotes}
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">
          {meeting.internalNotes.trim() || uiZh.emDash}
        </p>
      </section>
    </div>
  );
}
