/**
 * Finance permission keys (placeholder).
 * Enforcement is deferred until the permission engine wires domain modules.
 */

export const FINANCE_PERMISSIONS = [
  "finance.read",
  "finance.write",
  "finance.delete",
  "finance.export",
  "finance.approve",
] as const;

export type FinancePermission = (typeof FINANCE_PERMISSIONS)[number];
