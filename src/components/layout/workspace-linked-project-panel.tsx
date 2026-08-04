import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { WorkspaceEntityLink } from "@/components/layout/workspace-entity-link";
import { uiZh } from "@/config/ui-zh";
import type { Project } from "@/core/types";

type WorkspaceLinkedProjectPanelProps = {
  linkedProject: Project | null;
  emptyDescription?: string;
};

function statusLabel(status: Project["status"]) {
  switch (status) {
    case "inquiry":
      return uiZh.weddingStatusInquiry;
    case "proposal":
      return "Proposal";
    case "confirmed":
      return uiZh.confirmed;
    case "planning":
      return uiZh.projectStatusPlanning;
    case "execution":
      return uiZh.projectStatusActive;
    case "completed":
      return uiZh.projectStatusCompleted;
    case "cancelled":
      return uiZh.cancelled;
    case "archived":
      return uiZh.projectStatusArchived;
    default:
      return status;
  }
}

/** Shared Projects-tab panel for Client / Vendor workspaces. */
export function WorkspaceLinkedProjectPanel({
  linkedProject,
  emptyDescription = uiZh.linkProjectFromEdit,
}: WorkspaceLinkedProjectPanelProps) {
  if (!linkedProject) {
    return (
      <ModuleEmptyState
        title={uiZh.noProjectLinkedTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.linkedProjectTitle}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.linkedProjectAssociated}
        </p>
      </div>

      <WorkspaceEntityLink
        kind="project"
        id={linkedProject.id}
        className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 transition-colors hover:bg-white/[0.05] sm:px-5"
      >
        <p className="truncate text-sm font-medium text-white">
          {linkedProject.name}
        </p>
        <p className="mt-1 truncate text-xs text-white/45">
          {statusLabel(linkedProject.status)}
          {linkedProject.project_type ? ` · ${linkedProject.project_type}` : ""}
        </p>
      </WorkspaceEntityLink>
    </section>
  );
}
