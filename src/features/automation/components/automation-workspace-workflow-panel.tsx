"use client";

import { useState } from "react";

import type { AutomationWorkspaceModel } from "@/features/automation/lib/automation-types";
import {
  automationStatusLabel,
  formatAutomationDateTime,
} from "@/features/automation/lib/automation-labels";
import { uiZh } from "@/config/ui-zh";

type AutomationWorkspaceWorkflowPanelProps = {
  automation: AutomationWorkspaceModel;
};

export function AutomationWorkspaceWorkflowPanel({
  automation,
}: AutomationWorkspaceWorkflowPanelProps) {
  const [enabled, setEnabled] = useState(automation.enabled);

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.workflow}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.workflowPreviewDesc}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-[11px] text-white/40">{uiZh.name}</p>
            <p className="mt-1 text-sm text-white">{automation.name}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/40">{uiZh.type}</p>
            <p className="mt-1 text-sm text-white/80">
              {automation.type === "workflow" ? uiZh.workflowType : automation.type}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-white/40">{uiZh.status}</p>
            <span className="mt-1 inline-flex rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/70">
              {automationStatusLabel(automation.status)}
            </span>
          </div>
          <div>
            <p className="text-[11px] text-white/40">{uiZh.updated}</p>
            <p className="mt-1 text-sm text-white/70">
              {formatAutomationDateTime(automation.updatedAt)}
            </p>
          </div>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
          <span className="text-sm text-white/80">
            {enabled ? uiZh.enabled : uiZh.disabled}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((value) => !value)}
            className={
              enabled
                ? "relative h-6 w-11 rounded-full bg-white/80 transition-colors"
                : "relative h-6 w-11 rounded-full bg-white/15 transition-colors"
            }
          >
            <span
              className={
                enabled
                  ? "absolute top-0.5 left-[22px] size-5 rounded-full bg-black transition-all"
                  : "absolute top-0.5 left-0.5 size-5 rounded-full bg-white/70 transition-all"
              }
            />
          </button>
        </label>
      </div>

      <div className="mt-6">
        <p className="text-[11px] text-white/40">{uiZh.description}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">
          {automation.description?.trim() || uiZh.noDescription}
        </p>
      </div>
    </section>
  );
}
