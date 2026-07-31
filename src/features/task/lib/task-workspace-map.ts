import type { Task } from "@/core/task";
import type { TaskWorkspaceItem } from "@/features/task/lib/task-types";

type RelationMaps = {
  projectNames?: Map<string, string>;
  clientNames?: Map<string, string>;
  vendorNames?: Map<string, string>;
  memberNames?: Map<string, string>;
};

export function toTaskWorkspaceItem(
  task: Task,
  maps: RelationMaps = {},
): TaskWorkspaceItem {
  return {
    ...task,
    relatedProjectName: task.relatedProjectId
      ? (maps.projectNames?.get(task.relatedProjectId) ?? null)
      : null,
    relatedClientName: task.relatedClientId
      ? (maps.clientNames?.get(task.relatedClientId) ?? null)
      : null,
    relatedVendorName: task.relatedVendorId
      ? (maps.vendorNames?.get(task.relatedVendorId) ?? null)
      : null,
    relatedMeetingName: null,
    ownerLabel: task.ownerId
      ? (maps.memberNames?.get(task.ownerId) ?? null)
      : null,
    assigneeLabel: task.assigneeId
      ? (maps.memberNames?.get(task.assigneeId) ?? null)
      : null,
  };
}
