import type {
  AutomationActionType,
  AutomationConditionType,
  AutomationStatus,
  AutomationTriggerType,
} from "@/core/automation";
import {
  getAutomationActionDefinition,
  getAutomationConditionDefinition,
  getAutomationTriggerDefinition,
} from "@/core/automation";
import { uiZh } from "@/config/ui-zh";

export function formatAutomationDateTime(
  value: string | null | undefined,
): string {
  if (!value) return uiZh.emDash;
  return new Date(value).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function automationStatusLabel(status: AutomationStatus): string {
  switch (status) {
    case "draft":
      return uiZh.draft;
    case "active":
      return uiZh.active;
    case "paused":
      return uiZh.suspended;
    case "archived":
      return uiZh.archived;
    default:
      return status;
  }
}

export function automationTriggerLabel(type: AutomationTriggerType): string {
  return getAutomationTriggerDefinition(type)?.label ?? type;
}

export function automationConditionLabel(
  type: AutomationConditionType,
): string {
  return getAutomationConditionDefinition(type)?.label ?? type;
}

export function automationActionLabel(type: AutomationActionType): string {
  return getAutomationActionDefinition(type)?.label ?? type;
}

export function formatConditionValue(value: unknown): string {
  if (value === null || value === undefined) return uiZh.emDash;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
