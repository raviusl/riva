import { notFound } from "next/navigation";

import { ClientProfile } from "@/components/crm/client-profile";
import { requireDashboardContext } from "@/core/auth/context";
import { getClientById } from "@/core/client/client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientProfilePage({ params }: PageProps) {
  const { id } = await params;
  const context = await requireDashboardContext();

  if (!context.permissions.has("client.read")) {
    notFound();
  }

  let client;
  try {
    client = await getClientById(
      id,
      context.workspace.id,
      context.company.id,
    );
  } catch {
    notFound();
  }

  return (
    <ClientProfile
      client={client}
      canWrite={context.permissions.has("client.write")}
    />
  );
}
