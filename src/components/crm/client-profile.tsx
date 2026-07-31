import Link from "next/link";

import {
  formatClientStatus,
  formatClientUpdatedAt,
  parseClientCompanyFromNotes,
  parseClientNotesBody,
} from "@/components/crm/client-notes";
import { SectionEmptyState } from "@/components/shared/section-empty-state";
import { WorkspaceSection } from "@/components/shared/workspace-section";
import { uiZh } from "@/config/ui-zh";
import type { Client } from "@/core/types";
import {
  brandPageClassName,
  brandSecondaryButtonClassName,
  brandTitleClassName,
} from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

type ClientProfileProps = {
  client: Client;
  canWrite: boolean;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-baseline">
      <dt className="text-xs tracking-tight text-white/35">{label}</dt>
      <dd className="text-sm text-white/85 break-words">{value}</dd>
    </div>
  );
}

function PlaceholderSection({
  title,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <WorkspaceSection title={title}>
      <SectionEmptyState
        title={emptyTitle}
        description={emptyDescription}
        className="px-4 py-6"
      />
    </WorkspaceSection>
  );
}

export function ClientProfile({ client, canWrite }: ClientProfileProps) {
  const companyName = parseClientCompanyFromNotes(client.notes);
  const notesBody = parseClientNotesBody(client.notes);

  return (
    <div className={cn(brandPageClassName, "max-w-3xl space-y-12")}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/clients"
            className="text-xs text-white/35 transition duration-200 hover:text-white/60"
          >
            {uiZh.backToList(uiZh.clients)}
          </Link>
          <h1 className={cn("mt-3", brandTitleClassName)}>{client.name}</h1>
          <p className="mt-2 text-sm text-white/40">
            {formatClientStatus(client.status)}
            <span className="mx-2 text-white/20">·</span>
            {uiZh.updatedAtLabel(formatClientUpdatedAt(client.updated_at))}
          </p>
        </div>
        {canWrite && client.status !== "archived" ? (
          <Link
            href={`/dashboard/clients/${client.id}/edit`}
            className={brandSecondaryButtonClassName}
          >
            {uiZh.edit}
          </Link>
        ) : null}
      </div>

      <WorkspaceSection title={uiZh.clientInformation}>
        <div className="riva-surface rounded-[var(--riva-radius-lg)] px-6 py-6">
          <dl className="space-y-4">
            <InfoRow label={uiZh.clientName} value={client.name} />
            <InfoRow label={uiZh.company} value={companyName ?? uiZh.emDash} />
            <InfoRow label={uiZh.status} value={formatClientStatus(client.status)} />
            <InfoRow label={uiZh.email} value={client.email?.trim() || uiZh.emDash} />
            <InfoRow label={uiZh.phone} value={client.phone?.trim() || uiZh.emDash} />
            <InfoRow label={uiZh.notes} value={notesBody ?? uiZh.emDash} />
          </dl>
        </div>
      </WorkspaceSection>

      <PlaceholderSection
        title={uiZh.recentActivity}
        emptyTitle={uiZh.noActivityYet}
        emptyDescription={uiZh.clientActivitySoon}
      />

      <PlaceholderSection
        title={uiZh.projects}
        emptyTitle={uiZh.noProjectsYet}
        emptyDescription={uiZh.linkedProjectsSoon}
      />

      <PlaceholderSection
        title={uiZh.notes}
        emptyTitle={uiZh.noAdditionalNotes}
        emptyDescription={uiZh.extendedNotesSoon}
      />
    </div>
  );
}
