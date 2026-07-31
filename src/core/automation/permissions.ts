/**
 * Automation permission keys (placeholder).
 * Enforcement is deferred until the permission engine wires domain modules.
 */

export const AUTOMATION_PERMISSIONS = [
  "automation.read",
  "automation.write",
  "automation.delete",
  "automation.manage",
] as const;

export type AutomationPermission = (typeof AUTOMATION_PERMISSIONS)[number];
