import { uiZh } from "@/config/ui-zh";
import type { MeetingDecision } from "@/features/meeting/lib/meeting-types";

type MeetingWorkspaceDecisionsProps = {
  decisions: MeetingDecision[];
};

function statusLabel(status: MeetingDecision["status"]) {
  switch (status) {
    case "accepted":
      return uiZh.decisionAccepted;
    case "rejected":
      return uiZh.decisionRejected;
    case "deferred":
      return uiZh.decisionDeferred;
    case "proposed":
    default:
      return uiZh.decisionProposed;
  }
}

function statusClass(status: MeetingDecision["status"]) {
  switch (status) {
    case "accepted":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "rejected":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    case "deferred":
      return "border-amber-500/20 bg-amber-500/10 text-amber-200";
    default:
      return "border-white/10 bg-white/[0.06] text-white/70";
  }
}

export function MeetingWorkspaceDecisions({
  decisions,
}: MeetingWorkspaceDecisionsProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-medium text-white">
          {uiZh.decisionsCount(decisions.length)}
        </h2>
        <p className="mt-1 text-xs text-white/45">{uiZh.decisionsDesc}</p>
      </div>

      {decisions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center">
          <p className="text-sm text-white/45">{uiZh.noDecisionsYet}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {decisions.map((decision) => (
            <li
              key={decision.id}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 sm:px-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">
                    {decision.title}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {uiZh.ownerPrefix} {decision.owner}
                    {decision.notes ? ` · ${decision.notes}` : ""}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusClass(decision.status)}`}
                >
                  {statusLabel(decision.status)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
