import Link from "next/link";
import type { ReactNode } from "react";

import { WorkspaceEntityLink } from "@/components/layout/workspace-entity-link";
import type { AutomationWorkspaceModel } from "@/features/automation/lib/automation-types";
import {
  automationActionLabel,
  automationConditionLabel,
  automationStatusLabel,
  automationTriggerLabel,
  formatAutomationDateTime,
} from "@/features/automation/lib/automation-labels";
import { buildAutomationWorkspaceTabHref } from "@/features/automation/lib/automation-workspace-tabs";
import { uiZh } from "@/config/ui-zh";

type AutomationWorkspaceOverviewProps = {
  automation: AutomationWorkspaceModel;
};

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:items-baseline">
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="text-sm text-white/80 break-words">{value}</dd>
    </div>
  );
}

export function AutomationWorkspaceOverview({
  automation,
}: AutomationWorkspaceOverviewProps) {
  const workflowHref = buildAutomationWorkspaceTabHref(
    automation.id,
    "workflow",
  );
  const triggerHref = buildAutomationWorkspaceTabHref(automation.id, "trigger");
  const conditionsHref = buildAutomationWorkspaceTabHref(
    automation.id,
    "conditions",
  );
  const actionsHref = buildAutomationWorkspaceTabHref(automation.id, "actions");

  const groupModeLabel =
    automation.conditionGroupMode === "and" ? uiZh.andMode : uiZh.orMode;
  const conditionSummary =
    automation.conditions.length === 0
      ? uiZh.noConditions
      : `${uiZh.conditionCountSummary(automation.conditions.length, groupModeLabel)} · ${automation.conditions.map((c) => automationConditionLabel(c.type)).join("、")}`;

  const actionSummary =
    automation.actions.length === 0
      ? uiZh.noActions
      : `${uiZh.actionCountSummary(automation.actions.length)} · ${[...automation.actions]
          .sort((a, b) => a.order - b.order)
          .map((a) => automationActionLabel(a.type))
          .join(" → ")}`;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">{uiZh.workflowOverview}</h2>
            <p className="mt-1 text-xs text-white/45">
              {uiZh.automationPreviewSummary}
            </p>
          </div>
          <Link
            href={workflowHref}
            className="inline-flex w-fit rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
          >
            {uiZh.openWorkflow}
          </Link>
        </div>

        <dl className="mt-5 space-y-4">
          <InfoRow label={uiZh.workflowName} value={automation.name} />
          <InfoRow
            label={uiZh.status}
            value={automationStatusLabel(automation.status)}
          />
          <InfoRow
            label={uiZh.enabled}
            value={automation.enabled ? uiZh.yes : uiZh.no}
          />
          <InfoRow
            label={uiZh.triggerSummary}
            value={
              <Link
                href={triggerHref}
                className="text-white/80 hover:text-white"
              >
                {automationTriggerLabel(automation.trigger.type)}
              </Link>
            }
          />
          <InfoRow
            label={uiZh.conditionsSummary}
            value={
              <Link
                href={conditionsHref}
                className="text-white/80 hover:text-white"
              >
                {conditionSummary}
              </Link>
            }
          />
          <InfoRow
            label={uiZh.actionsSummary}
            value={
              <Link
                href={actionsHref}
                className="text-white/80 hover:text-white"
              >
                {actionSummary}
              </Link>
            }
          />
          <InfoRow
            label={uiZh.lastModified}
            value={formatAutomationDateTime(automation.updatedAt)}
          />
          <InfoRow
            label={uiZh.relatedProjectTitle}
            value={
              automation.relatedProjectId && automation.relatedProjectName ? (
                <WorkspaceEntityLink
                  kind="project"
                  id={automation.relatedProjectId}
                >
                  {automation.relatedProjectName}
                </WorkspaceEntityLink>
              ) : (
                uiZh.emDash
              )
            }
          />
        </dl>
      </section>
    </div>
  );
}
