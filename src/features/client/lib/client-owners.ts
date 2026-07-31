import { listWorkspaceMembers } from "@/core/membership/membership";
import type { ClientOwnerOption } from "@/features/client/components/create-client-form";

export async function listClientOwnerOptions(
  workspaceId: string,
  companyId: string,
): Promise<ClientOwnerOption[]> {
  const members = await listWorkspaceMembers(workspaceId);
  return members
    .filter(
      (member) =>
        member.status === "accepted" &&
        member.user_id &&
        (member.company_id === null || member.company_id === companyId),
    )
    .map((member) => ({
      userId: member.user_id as string,
      fullName: member.full_name,
    }));
}

export function ownerLabelFromOptions(
  ownerId: string | null,
  owners: readonly ClientOwnerOption[],
): string | null {
  if (!ownerId) return null;
  return owners.find((owner) => owner.userId === ownerId)?.fullName ?? null;
}
