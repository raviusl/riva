import Link from "next/link";

import {
  formatClientStatus,
  parseClientCompanyFromNotes,
  parseClientNotesBody,
} from "@/components/crm/client-notes";
import type { Client, Project } from "@/core/types";
import { uiZh } from "@/config/ui-zh";

type ClientWorkspaceOverviewProps = {
  client: Client;
  linkedProject: Project | null;
  ownerLabel: string | null;
  picLabel?: string | null;
  canWriteClient: boolean;
};

function typeLabel(type: Client["client_type"]) {
  switch (type) {
    case "wedding":
      return uiZh.clientTypeWedding;
    case "corporate":
      return uiZh.clientTypeCorporate;
    case "private":
      return uiZh.clientTypePrivate;
    case "others":
      return uiZh.clientTypeOthers;
    default:
      return uiZh.emDash;
  }
}

function formatDate(value: string | null) {
  if (!value) return uiZh.emDash;
  return new Date(value).toLocaleDateString("zh-CN", {
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <h2 className="text-sm font-medium text-white">{title}</h2>
      <dl className="mt-5 space-y-3">{children}</dl>
    </section>
  );
}

/** Overview — Client CRM contact, wedding info, ownership. */
export function ClientWorkspaceOverview({
  client,
  linkedProject,
  ownerLabel,
  picLabel,
  canWriteClient,
}: ClientWorkspaceOverviewProps) {
  const companyFromNotes = parseClientCompanyFromNotes(client.notes);
  const notesBody = parseClientNotesBody(client.notes);
  const companyName = client.company_name || companyFromNotes;
  const display =
    client.display_name ||
    [client.bride_name, client.groom_name].filter(Boolean).join(" & ") ||
    client.name;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-white/35">
            {client.client_code || uiZh.clientCode}
          </p>
          <h2 className="mt-1 text-lg font-medium text-white">{display}</h2>
          <p className="mt-1 text-xs text-white/45">
            {typeLabel(client.client_type)} · {formatClientStatus(client.status)}
            {" · "}
            {client.is_active ? uiZh.filterActive : uiZh.filterInactive}
          </p>
        </div>
        {canWriteClient && client.status !== "archived" ? (
          <Link
            href={`/dashboard/clients/${client.id}/edit`}
            className="inline-flex rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.05]"
          >
            {uiZh.edit}
          </Link>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title={uiZh.clientInformation}>
          <InfoRow label={uiZh.companyName} value={companyName || uiZh.emDash} />
          <InfoRow label={uiZh.brideName} value={client.bride_name || uiZh.emDash} />
          <InfoRow label={uiZh.groomName} value={client.groom_name || uiZh.emDash} />
          <InfoRow
            label={uiZh.contactPerson}
            value={client.contact_person || uiZh.emDash}
          />
          <InfoRow label={uiZh.phone} value={client.phone || uiZh.emDash} />
          <InfoRow label={uiZh.whatsapp} value={client.whatsapp || uiZh.emDash} />
          <InfoRow label={uiZh.email} value={client.email || uiZh.emDash} />
          <InfoRow
            label={uiZh.instagram}
            value={client.instagram || uiZh.emDash}
          />
          <InfoRow label={uiZh.facebook} value={client.facebook || uiZh.emDash} />
          <InfoRow
            label={uiZh.homeAddress}
            value={client.home_address || uiZh.emDash}
          />
          <InfoRow
            label={`${uiZh.city} / ${uiZh.state}`}
            value={
              [client.city, client.state, client.country]
                .filter(Boolean)
                .join(", ") || uiZh.emDash
            }
          />
        </Section>

        <Section title={uiZh.weddingDate}>
          <InfoRow
            label={uiZh.weddingDate}
            value={formatDate(client.wedding_date)}
          />
          <InfoRow
            label={uiZh.weddingType}
            value={client.wedding_type || uiZh.emDash}
          />
          <InfoRow
            label={uiZh.weddingSession}
            value={client.session || uiZh.emDash}
          />
          <InfoRow
            label={uiZh.includeRom}
            value={client.include_rom ? uiZh.yes : uiZh.no}
          />
          <InfoRow
            label={uiZh.includeLunch}
            value={client.include_lunch ? uiZh.yes : uiZh.no}
          />
          <InfoRow
            label={uiZh.includeDinner}
            value={client.include_dinner ? uiZh.yes : uiZh.no}
          />
          <InfoRow label={uiZh.venue} value={client.venue || uiZh.emDash} />
          <InfoRow
            label={uiZh.ballroom}
            value={client.ballroom || uiZh.emDash}
          />
          <InfoRow
            label={uiZh.expectedPax}
            value={
              client.expected_pax != null
                ? String(client.expected_pax)
                : uiZh.emDash
            }
          />
          <InfoRow label={uiZh.theme} value={client.theme || uiZh.emDash} />
          <InfoRow
            label={uiZh.dressCode}
            value={client.dress_code || uiZh.emDash}
          />
          <InfoRow
            label={uiZh.religion}
            value={client.religion || uiZh.emDash}
          />
          <InfoRow
            label={uiZh.language}
            value={client.language || uiZh.emDash}
          />
        </Section>
      </div>

      <Section title={uiZh.status}>
        <InfoRow label={uiZh.leadOwner} value={ownerLabel || uiZh.unassigned} />
        <InfoRow label={uiZh.assignedPic} value={picLabel || uiZh.unassigned} />
        <InfoRow
          label={uiZh.clientSource}
          value={client.source || uiZh.emDash}
        />
        <InfoRow
          label={uiZh.followUp}
          value={formatDate(client.follow_up_at)}
        />
        <InfoRow label={uiZh.notes} value={notesBody || uiZh.emDash} />
        {linkedProject ? (
          <InfoRow
            label={uiZh.projects}
            value={linkedProject.name}
          />
        ) : null}
      </Section>
    </div>
  );
}
