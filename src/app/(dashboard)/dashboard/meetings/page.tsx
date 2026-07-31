import Link from "next/link";

import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { listMeetingsByCompany } from "@/core/meeting/meeting";
import { listProjectsByCompany } from "@/core/project/project";
import { MeetingListItem } from "@/features/meeting/components/meeting-list-item";
import {
  listMeetingOwnerOptions,
  ownerLabelFromOptions,
} from "@/features/meeting/lib/meeting-owners";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function MeetingsPage({ searchParams }: PageProps) {
  const context = await requireDashboardContext();
  const params = await searchParams;

  if (!context.permissions.has("meeting.read")) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/[0.08] px-5 py-8 text-sm text-white/55">
        {uiZh.noPermissionMeetings}
      </div>
    );
  }

  const [meetings, projects, clients, owners] = await Promise.all([
    listMeetingsByCompany(context.workspace.id, context.company.id),
    listProjectsByCompany(context.workspace.id, context.company.id),
    listClientsByCompany(context.workspace.id, context.company.id),
    listMeetingOwnerOptions(context.workspace.id, context.company.id),
  ]);

  const canWrite = context.permissions.has("meeting.write");
  const projectNames = new Map(
    projects.map((project) => [project.id, project.name]),
  );
  const clientNames = new Map(
    clients.map((client) => [client.id, client.name]),
  );

  const statusFilter = params.status?.trim() || "upcoming";
  const now = Date.now();
  const visible = meetings.filter((meeting) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "cancelled") return meeting.status === "cancelled";
    if (statusFilter === "completed") return meeting.status === "completed";
    if (statusFilter === "no_show") return meeting.status === "no_show";
    if (statusFilter === "confirmed") return meeting.status === "confirmed";
    if (statusFilter === "scheduled") return meeting.status === "scheduled";
    // upcoming default: not cancelled/completed/no_show, or future starts
    return (
      meeting.status === "scheduled" ||
      meeting.status === "confirmed" ||
      (meeting.status !== "cancelled" &&
        new Date(meeting.starts_at).getTime() >= now)
    );
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl text-white">{uiZh.meetings}</h1>
          <p className="mt-2 text-sm text-white/45">
            {uiZh.meetingScheduleFor}{" "}
            <span className="text-white/70">{context.company.name}</span>
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/dashboard/meetings/new"
            className="inline-flex w-fit rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            {uiZh.create}
          </Link>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {(
          [
            { id: "upcoming", label: uiZh.upcoming },
            { id: "scheduled", label: uiZh.scheduled },
            { id: "confirmed", label: uiZh.confirmed },
            { id: "completed", label: uiZh.completed },
            { id: "cancelled", label: uiZh.cancelled },
            { id: "no_show", label: uiZh.noShow },
            { id: "all", label: uiZh.all },
          ] as const
        ).map((filter) => {
          const href =
            filter.id === "upcoming"
              ? "/dashboard/meetings"
              : `/dashboard/meetings?status=${filter.id}`;
          const active = statusFilter === filter.id;
          return (
            <Link
              key={filter.id}
              href={href}
              className={
                active
                  ? "rounded-lg border border-white/20 bg-white/[0.06] px-3 py-1.5 text-white"
                  : "rounded-lg border border-white/10 px-3 py-1.5 text-white/45 hover:text-white/70"
              }
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <ModuleEmptyState
          title={uiZh.noMeetingsYet}
          description={uiZh.scheduleMeetingsDesc}
          actionHref={canWrite ? "/dashboard/meetings/new" : undefined}
          actionLabel={canWrite ? uiZh.createMeeting : undefined}
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((meeting) => (
            <li key={meeting.id}>
              <MeetingListItem
                workspaceId={context.workspace.id}
                companyId={context.company.id}
                meeting={meeting}
                canWrite={canWrite}
                projectName={
                  meeting.project_id
                    ? (projectNames.get(meeting.project_id) ?? null)
                    : null
                }
                clientName={
                  meeting.client_id
                    ? (clientNames.get(meeting.client_id) ?? null)
                    : null
                }
                ownerName={ownerLabelFromOptions(meeting.owner_id, owners)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
