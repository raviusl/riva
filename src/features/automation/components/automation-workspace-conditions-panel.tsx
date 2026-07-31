"use client";

import { useState } from "react";

import type {
  AutomationWorkspaceModel,
  ConditionGroupMode,
} from "@/features/automation/lib/automation-types";
import {
  automationConditionLabel,
  formatConditionValue,
} from "@/features/automation/lib/automation-labels";
import { uiZh } from "@/config/ui-zh";

type AutomationWorkspaceConditionsPanelProps = {
  automation: AutomationWorkspaceModel;
};

export function AutomationWorkspaceConditionsPanel({
  automation,
}: AutomationWorkspaceConditionsPanelProps) {
  const [groupMode, setGroupMode] = useState<ConditionGroupMode>(
    automation.conditionGroupMode,
  );

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-white">{uiZh.conditions}</h2>
          <p className="mt-1 text-xs text-white/45">
            {uiZh.conditionsListDesc}
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-white/10 p-0.5">
          {(["and", "or"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setGroupMode(mode)}
              className={
                groupMode === mode
                  ? "rounded-md bg-white/[0.1] px-3 py-1.5 text-xs text-white"
                  : "rounded-md px-3 py-1.5 text-xs text-white/45 hover:text-white/70"
              }
            >
              {mode === "and" ? uiZh.andMode : uiZh.orMode}
            </button>
          ))}
        </div>
      </div>

      {automation.conditions.length === 0 ? (
        <p className="mt-6 text-sm text-white/45">{uiZh.noConditionsConfigured}</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {automation.conditions.map((condition, index) => (
            <li key={condition.id}>
              {index > 0 ? (
                <p className="mb-2 text-[11px] font-medium tracking-wide text-white/35">
                  {groupMode === "and" ? uiZh.andMode : uiZh.orMode}
                </p>
              ) : null}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-white">
                    {automationConditionLabel(condition.type)}
                  </p>
                  <span className="text-[11px] text-white/35">
                    {condition.field}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
                  <span>{uiZh.valueLabel} {formatConditionValue(condition.value)}</span>
                  {condition.type === "between" ? (
                    <span>
                      {uiZh.toLabel} {formatConditionValue(condition.valueTo)}
                    </span>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
