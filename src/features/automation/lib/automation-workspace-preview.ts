import type { AutomationWorkspaceModel } from "@/features/automation/lib/automation-types";
import { AUTOMATION_WORKSPACE_PREVIEW_ID } from "@/features/automation/lib/automation-workspace-tabs";
import { uiZh } from "@/config/ui-zh";

const COMPANY_ID = "00000000-0000-4000-8000-000000000001";
const WORKSPACE_ID = "00000000-0000-4000-8000-000000000002";
const PROJECT_ID = "00000000-0000-4000-8000-000000000010";
const ACTOR = "00000000-0000-4000-8000-0000000000a1";

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/**
 * UI foundation sample Automation Workspace.
 * Execution engine / scheduler / workers are intentionally out of scope.
 */
export function getAutomationWorkspacePreview(
  automationId: string = AUTOMATION_WORKSPACE_PREVIEW_ID,
): AutomationWorkspaceModel {
  return {
    id: automationId.trim() || AUTOMATION_WORKSPACE_PREVIEW_ID,
    companyId: COMPANY_ID,
    workspaceId: WORKSPACE_ID,
    name: "任务完成 → 跟进",
    description:
      "当任务标记为完成时，通知执行人，并在短暂延迟后创建跟进任务。",
    type: "workflow",
    trigger: {
      type: "task_completed",
      schedule: null,
      metadata: {
        source: "task",
        matchStatus: "done",
      },
    },
    conditions: [
      {
        id: "c1",
        type: "equals",
        field: "priority",
        value: "high",
        valueTo: null,
      },
      {
        id: "c2",
        type: "not_empty",
        field: "assigneeId",
        value: null,
        valueTo: null,
      },
      {
        id: "c3",
        type: "contains",
        field: "title",
        value: "client",
        valueTo: null,
      },
    ],
    actions: [
      {
        id: "a1",
        type: "delay",
        order: 1,
        config: { minutes: 15 },
      },
      {
        id: "a2",
        type: "send_notification",
        order: 2,
        config: {
          template: "task_completed",
          channel: "in_app",
        },
      },
      {
        id: "a3",
        type: "create_task",
        order: 3,
        config: {
          title: "跟进：{{taskTitle}}",
          priority: "medium",
        },
      },
      {
        id: "a4",
        type: "create_meeting",
        order: 4,
        config: {
          title: "复盘：{{taskTitle}}",
        },
      },
      {
        id: "a5",
        type: "create_document",
        order: 5,
        config: {
          name: "完成备注 — {{taskTitle}}",
        },
      },
      {
        id: "a6",
        type: "webhook",
        order: 6,
        config: {
          url: "https://hooks.example.com/riva/task-completed",
          method: "POST",
        },
      },
    ],
    status: "active",
    enabled: true,
    createdBy: ACTOR,
    updatedBy: ACTOR,
    createdAt: daysAgo(14),
    updatedAt: daysAgo(1),
    conditionGroupMode: "and",
    relatedProjectId: PROJECT_ID,
    relatedProjectName: uiZh.previewChenWedding,
  };
}
