import { requireSessionUserId } from "@/core/auth/session";
import { listBusinessesForUser } from "@/core/os/business";
import { OsBusinessPicker } from "@/features/os/components/os-business-picker";
import { OsEntryShell } from "@/features/os/components/os-entry-shell";

export default async function OsBusinessPage() {
  const userId = await requireSessionUserId();
  const businesses = await listBusinessesForUser(userId);

  return (
    <OsEntryShell>
      <OsBusinessPicker businesses={businesses} />
    </OsEntryShell>
  );
}
