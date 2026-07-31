import { enterOsAction } from "@/core/actions/os-actions";
import { requireSessionUserId } from "@/core/auth/session";
import { safeAuthNextPath } from "@/features/auth/lib/auth-ui";

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function EnterDashboardPage({ searchParams }: PageProps) {
  await requireSessionUserId();
  const params = await searchParams;
  const nextPath = safeAuthNextPath(params.next, "/dashboard");
  await enterOsAction(nextPath);
}
