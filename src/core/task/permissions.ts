/**
 * Task permission keys (placeholder).
 * Enforcement is deferred until the permission engine wires domain modules.
 */

export const TASK_PERMISSIONS = [
  "task.read",
  "task.write",
  "task.assign",
  "task.complete",
] as const;

export type TaskPermission = (typeof TASK_PERMISSIONS)[number];
