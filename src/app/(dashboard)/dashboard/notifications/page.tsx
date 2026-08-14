import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { brandGlassPanelClassName, brandPageClassName } from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

/**
 * Notifications list — Internal MVP Phase 1.
 * In-app Notification Center (topbar) is the live surface.
 * Notification Workspace preview is not linked as product.
 */
export default async function NotificationsPage() {
  await requireDashboardContext();

  return (
    <div className={cn(brandPageClassName, "max-w-3xl space-y-6")}>
      <div>
        <h1 className="text-xl text-white">{uiZh.notificationCenter}</h1>
        <p className="mt-2 text-sm text-white/45">{uiZh.notificationCenterDesc}</p>
      </div>

      <div
        className={cn(
          brandGlassPanelClassName,
          "rounded-2xl px-5 py-8 text-sm text-white/50",
        )}
      >
        {uiZh.notificationCenterDesc}
      </div>
    </div>
  );
}
