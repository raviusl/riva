import type { Automation } from "@/core/automation";

export type ConditionGroupMode = "and" | "or";

/** Automation Workspace UI model (preview until persistence). */
export type AutomationWorkspaceModel = Automation & {
  conditionGroupMode: ConditionGroupMode;
  relatedProjectId: string | null;
  relatedProjectName: string | null;
};
