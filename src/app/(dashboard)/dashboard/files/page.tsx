import { FileList } from "@/components/files/file-list";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listProjectsByCompany } from "@/core/project/project";

export default async function FilesPage() {
  const context = await requireDashboardContext();

  const projects = await listProjectsByCompany(
    context.workspace.id,
    context.company.id,
  );

  const uploaderName =
    context.membership.full_name?.trim() ||
    context.membership.email ||
    uiZh.you;

  return (
    <FileList
      workspaceId={context.workspace.id}
      companyId={context.company.id}
      businessName={context.company.name}
      projects={projects.map((project) => ({
        id: project.id,
        name: project.name,
      }))}
      uploaderId={context.userId}
      uploaderName={uploaderName}
      canWrite={
        context.permissions.has("project.write") ||
        context.permissions.has("document.write")
      }
    />
  );
}
