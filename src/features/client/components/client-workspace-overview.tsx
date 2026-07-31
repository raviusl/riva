import Link from "next/link";

import { WorkspaceEntityLink } from "@/components/layout/workspace-entity-link";
import type { Client, Project } from "@/core/types";
import { uiZh } from "@/config/ui-zh";

type ClientWorkspaceOverviewProps = {
  client: Client;
  linkedProject: Project | null;
  ownerLabel: string | null;
  canWriteClient: boolean;
};

function statusLabel(status: Client["status"]) {
  if (status === "follow_up") return uiZh.followUp;
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function typeLabel(type: Client["client_type"]) {
  if (!type) return uiZh.unspecified;
  if (type === "corporate") return uiZh.corporateClient;
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:items-baseline">
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="text-sm text-white/80 break-words">{value}</dd>
    </div>
  );
}

/** Overview tab — Client CRM contact, status, owner, notes. */
export function ClientWorkspaceOverview({
  client,
  linkedProject,
  ownerLabel,
  canWriteClient,
}: ClientWorkspaceOverviewProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">{uiZh.clientInformation}</h2>
            <p className="mt-1 text-xs text-white/45">
              Contact, status, and ownership for this client
            </p>
          </div>
          {canWriteClient && client.status !== "archived" ? (
            <Link
              href={`/dashboard/clients/${client.id}/edit`}
              className="inline-flex w-fit rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
            >
              Edit details
            </Link>
          ) : null}
        </div>

        <dl className="mt-5 space-y-4">
          <InfoRow label={uiZh.name} value={client.name} />
          <InfoRow label={uiZh.type} value={typeLabel(client.client_type)} />
          <InfoRow label={uiZh.status} value={statusLabel(client.status)} />
          <InfoRow label={uiZh.owner} value={ownerLabel?.trim() || uiZh.unassigned} />
          <InfoRow label={uiZh.email} value={client.email?.trim() || "—"} />
          <InfoRow label={uiZh.phone} value={client.phone?.trim() || "—"} />
          <InfoRow
            label={uiZh.followUp}
            value={formatDate(client.follow_up_at)}
          />
          <InfoRow label={uiZh.notes} value={client.notes?.trim() || "—"} />
          <InfoRow label={uiZh.updated} value={formatDate(client.updated_at)} />
        </dl>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <h2 className="text-sm font-medium text-white">{uiZh.linkedProjectTitle}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.optionalProjectAssociation}
        </p>
        {linkedProject ? (
          <WorkspaceEntityLink
            kind="project"
            id={linkedProject.id}
            className="mt-4 block rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
          >
            <p className="truncate text-sm text-white">{linkedProject.name}</p>
            <p className="mt-1 text-xs text-white/40">
              {linkedProject.status.charAt(0).toUpperCase() +
                linkedProject.status.slice(1)}
              {linkedProject.project_type
                ? ` · ${linkedProject.project_type}`
                : ""}
            </p>
          </WorkspaceEntityLink>
        ) : (
          <p className="mt-4 text-sm text-white/45">{uiZh.noProjectLinked}</p>
        )}
      </section>
    </div>
  );
}
