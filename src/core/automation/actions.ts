/**
 * Automation action catalog (contracts only — Project 039).
 * No action execution / webhook / delay runtime yet.
 */

import type { AutomationActionType } from "@/core/automation/constants";
import { AUTOMATION_ACTION_TYPES } from "@/core/automation/constants";
import type { AutomationAction } from "@/core/automation/types";

export type AutomationActionDefinition = {
  type: AutomationActionType;
  label: string;
  description: string;
};

export const AUTOMATION_ACTION_CATALOG: readonly AutomationActionDefinition[] =
  [
    {
      type: "create_task",
      label: "创建任务",
      description: "在工作区中创建任务",
    },
    {
      type: "update_task",
      label: "更新任务",
      description: "更新现有任务",
    },
    {
      type: "send_notification",
      label: "发送通知",
      description: "向接收人发送通知",
    },
    {
      type: "create_meeting",
      label: "创建会议",
      description: "创建会议",
    },
    {
      type: "create_document",
      label: "创建文档",
      description: "创建文档记录",
    },
    {
      type: "update_project",
      label: "更新项目",
      description: "更新项目",
    },
    {
      type: "assign_user",
      label: "分配用户",
      description: "将用户分配到实体",
    },
    {
      type: "webhook",
      label: "Webhook",
      description: "调用外部 Webhook URL",
    },
    {
      type: "delay",
      label: "延迟",
      description: "在继续工作流前等待",
    },
  ] as const;

export function isAutomationActionType(
  value: string,
): value is AutomationActionType {
  return (AUTOMATION_ACTION_TYPES as readonly string[]).includes(value);
}

export function getAutomationActionDefinition(
  type: AutomationActionType,
): AutomationActionDefinition | undefined {
  return AUTOMATION_ACTION_CATALOG.find((item) => item.type === type);
}

export function createAutomationAction(input: {
  id: string;
  type: AutomationActionType;
  order: number;
  config?: Record<string, unknown>;
}): AutomationAction {
  return {
    id: input.id,
    type: input.type,
    order: input.order,
    config: input.config ?? {},
  };
}
