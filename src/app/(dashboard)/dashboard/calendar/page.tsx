import { requireDashboardContext } from "@/core/auth/context";
import { uiZh } from "@/config/ui-zh";
import { CalendarEnginePanel } from "@/features/calendar-engine";
import { brandPageClassName } from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

export default async function CalendarPage() {
  const context = await requireDashboardContext();

  const canRead =
    context.permissions.has("meeting.read") ||
    context.permissions.has("task.read") ||
    context.permissions.has("timeline.read");

  if (!canRead) {
    return (
      <div
        className={cn(
          brandPageClassName,
          "max-w-3xl rounded-2xl border border-white/[0.08] px-5 py-8 text-sm text-white/55",
        )}
      >
        {uiZh.noPermissionCalendar}
      </div>
    );
  }

  return (
    <div className={cn(brandPageClassName, "max-w-6xl")}>
      <CalendarEnginePanel
        workspaceId={context.workspace.id}
        companyId={context.company.id}
      />
    </div>
  );
}
