import { redirect } from "next/navigation";

import { requireDashboardContext } from "@/core/auth/context";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

/**
 * Notification Workspace preview is out of Internal MVP.
 * Deep links redirect away from demo data.
 */
export default async function NotificationWorkspacePage(_props: PageProps) {
  await requireDashboardContext();
  redirect("/dashboard/notifications");
}
