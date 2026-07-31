/**
 * Automation trigger catalog (contracts only — Project 039).
 * No scheduler / event bus wiring yet.
 */

import type { AutomationTriggerType } from "@/core/automation/constants";
import { AUTOMATION_TRIGGER_TYPES } from "@/core/automation/constants";
import type { AutomationTrigger } from "@/core/automation/types";

export type AutomationTriggerDefinition = {
  type: AutomationTriggerType;
  label: string;
  description: string;
};

export const AUTOMATION_TRIGGER_CATALOG: readonly AutomationTriggerDefinition[] =
  [
    {
      type: "task_created",
      label: "任务已创建",
      description: "当任务被创建时触发",
    },
    {
      type: "task_updated",
      label: "任务已更新",
      description: "当任务被更新时触发",
    },
    {
      type: "task_completed",
      label: "任务已完成",
      description: "当任务标记为完成时触发",
    },
    {
      type: "meeting_created",
      label: "会议已创建",
      description: "当会议被创建时触发",
    },
    {
      type: "meeting_updated",
      label: "会议已更新",
      description: "当会议被更新时触发",
    },
    {
      type: "meeting_started",
      label: "会议已开始",
      description: "当会议开始时触发",
    },
    {
      type: "meeting_finished",
      label: "会议已结束",
      description: "当会议结束时触发",
    },
    {
      type: "project_created",
      label: "项目已创建",
      description: "当项目被创建时触发",
    },
    {
      type: "project_status_changed",
      label: "项目状态已变更",
      description: "当项目状态变更时触发",
    },
    {
      type: "client_created",
      label: "客户已创建",
      description: "当客户被创建时触发",
    },
    {
      type: "vendor_created",
      label: "供应商已创建",
      description: "当供应商被创建时触发",
    },
    {
      type: "document_uploaded",
      label: "文档已上传",
      description: "当文档被上传时触发",
    },
    {
      type: "invoice_paid",
      label: "发票已付款",
      description: "当发票付款完成时触发",
    },
    {
      type: "invoice_overdue",
      label: "发票已逾期",
      description: "当发票变为逾期时触发",
    },
    {
      type: "manual",
      label: "手动",
      description: "仅在手动触发时运行",
    },
    {
      type: "time_schedule",
      label: "定时计划",
      description: "按计划运行（cron / 间隔）",
    },
  ] as const;

export function isAutomationTriggerType(
  value: string,
): value is AutomationTriggerType {
  return (AUTOMATION_TRIGGER_TYPES as readonly string[]).includes(value);
}

export function getAutomationTriggerDefinition(
  type: AutomationTriggerType,
): AutomationTriggerDefinition | undefined {
  return AUTOMATION_TRIGGER_CATALOG.find((item) => item.type === type);
}

export function createAutomationTrigger(
  type: AutomationTriggerType,
  options?: { schedule?: string | null; metadata?: Record<string, unknown> },
): AutomationTrigger {
  return {
    type,
    schedule: options?.schedule ?? null,
    metadata: options?.metadata ?? {},
  };
}
