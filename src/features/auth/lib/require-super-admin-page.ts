import "server-only";

import { getSessionUser } from "@/features/auth/lib/get-session-user";
import { isSuperAdmin } from "@/features/auth/lib/platform-role";
import { redirectToLogin, redirectUnauthorized } from "@/lib/auth/redirects";

export async function requireSuperAdminPage() {
  const user = await getSessionUser();

  if (!user) {
    redirectToLogin({
      next: "/dashboard/settings/users",
      reason: "unauthenticated",
    });
  }

  if (!isSuperAdmin(user)) {
    redirectUnauthorized({ from: "/dashboard/settings/users" });
  }

  return user;
}

export async function getSessionIsSuperAdmin() {
  const user = await getSessionUser();
  return isSuperAdmin(user);
}
