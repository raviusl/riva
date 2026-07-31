import {
  getAutomationTriggerDefinition,
} from "@/core/automation";
import type { AutomationWorkspaceModel } from "@/features/automation/lib/automation-types";
import { automationTriggerLabel } from "@/features/automation/lib/automation-labels";
import { uiZh } from "@/config/ui-zh";

type AutomationWorkspaceTriggerPanelProps = {
  automation: AutomationWorkspaceModel;
};

export function AutomationWorkspaceTriggerPanel({
  automation,
}: AutomationWorkspaceTriggerPanelProps) {
  const { trigger } = automation;
  const definition = getAutomationTriggerDefinition(trigger.type);
  const metadataEntries = Object.entries(trigger.metadata ?? {});

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.trigger}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.triggerConfigDesc}
        </p>
      </div>

      <dl className="mt-5 space-y-4">
        <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:items-baseline">
          <dt className="text-xs text-white/40">{uiZh.triggerType}</dt>
          <dd className="text-sm text-white">
            {automationTriggerLabel(trigger.type)}
          </dd>
        </div>
        <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:items-baseline">
          <dt className="text-xs text-white/40">{uiZh.description}</dt>
          <dd className="text-sm text-white/70">
            {definition?.description ?? uiZh.emDash}
          </dd>
        </div>
        <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:items-baseline">
          <dt className="text-xs text-white/40">{uiZh.schedule}</dt>
          <dd className="text-sm text-white/70">{trigger.schedule ?? uiZh.emDash}</dd>
        </div>
      </dl>

      <div className="mt-6">
        <h3 className="text-xs font-medium text-white/50">
          {uiZh.triggerConfiguration}
        </h3>
        {metadataEntries.length === 0 ? (
          <p className="mt-2 text-sm text-white/45">{uiZh.noExtraConfig}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {metadataEntries.map(([key, value]) => (
              <li
                key={key}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm"
              >
                <span className="text-white/40">{key}</span>
                <span className="mt-1 block text-white/80">
                  {typeof value === "string"
                    ? value
                    : JSON.stringify(value)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-white/10 px-4 py-4">
        <p className="text-sm text-white/80">{uiZh.manualTriggerPreview}</p>
        <p className="mt-1 text-xs text-white/40">
          {uiZh.runNowUnavailable}
        </p>
        <button
          type="button"
          disabled
          className="mt-3 inline-flex cursor-not-allowed rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/35"
        >
          {uiZh.runManuallySoon}
        </button>
      </div>
    </section>
  );
}
