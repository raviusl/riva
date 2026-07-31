import { formatDistanceToNow } from "date-fns";

import type { AuditRecord } from "@/core/audit";
import { uiZh } from "@/config/ui-zh";

type ClientWorkspaceActivityPanelProps = {
  records: AuditRecord[];
};

/**
 * Activity tab — Audit Log trail for this client (in-memory until audit DB).
 */
export function ClientWorkspaceActivityPanel({
  records,
}: ClientWorkspaceActivityPanelProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.activity}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.auditTrailClient}
        </p>
      </div>

      {records.length === 0 ? (
        <p className="mt-4 text-sm text-white/45">
          {uiZh.noAuditedChanges}
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {records.map((record) => (
            <li
              key={record.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="text-sm capitalize text-white">{record.action}</p>
                <p className="text-[11px] text-white/35">
                  {formatDistanceToNow(new Date(record.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <p className="mt-1 text-xs text-white/45">
                Entity {record.entityType} · Actor{" "}
                {record.actorId?.slice(0, 8) ?? "system"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
