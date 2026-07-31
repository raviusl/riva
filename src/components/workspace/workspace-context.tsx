/**
 * @deprecated Project 070 — Workspace / Company / Role chrome belongs in the
 * Workspace Switcher, not on the homepage. Kept as a no-op for safe imports.
 */
type WorkspaceContextProps = {
  businessName: string;
  divisionName?: string | null;
  workspaceName: string;
};

export function WorkspaceContext(_props: WorkspaceContextProps) {
  return null;
}
