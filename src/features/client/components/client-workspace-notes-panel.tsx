import type { Client } from "@/core/types";
import { uiZh } from "@/config/ui-zh";

type ClientWorkspaceNotesPanelProps = {
  client: Client;
  canWriteClient: boolean;
};

/**
 * Notes tab — surfaces CRM notes field (edit via Edit Client).
 */
export function ClientWorkspaceNotesPanel({
  client,
  canWriteClient,
}: ClientWorkspaceNotesPanelProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.notes}</h2>
        <p className="mt-1 text-xs text-white/45">
          Internal CRM notes for this client
        </p>
      </div>

      {client.notes?.trim() ? (
        <p className="mt-4 whitespace-pre-wrap text-sm text-white/75">
          {client.notes}
        </p>
      ) : (
        <p className="mt-4 text-sm text-white/45">{uiZh.noNotesYet}</p>
      )}

      {canWriteClient && client.status !== "archived" ? (
        <p className="mt-4 text-xs text-white/35">
          {uiZh.updateNotesFromEditDetails}
        </p>
      ) : null}
    </section>
  );
}
