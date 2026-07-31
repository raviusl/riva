import { FileDetail } from "@/components/files/file-detail";
import { requireDashboardContext } from "@/core/auth/context";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function FileDetailPage({ params }: PageProps) {
  const { id } = await params;
  const context = await requireDashboardContext();

  return (
    <FileDetail
      workspaceId={context.workspace.id}
      companyId={context.company.id}
      fileId={id}
    />
  );
}
