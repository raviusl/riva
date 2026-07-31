import { SectionEmptyState } from "@/components/shared/section-empty-state";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";

export default async function ReportsPage() {
  await requireDashboardContext();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.12em] text-white/30 uppercase">
          {uiZh.reportsEyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          {uiZh.reportsTitle}
        </h1>
        <p className="mt-2 text-sm text-white/40">{uiZh.reportsDesc}</p>
      </div>

      <SectionEmptyState
        title={uiZh.noReportsYet}
        description={uiZh.reportsEmptyDesc}
        actionLabel={uiZh.backToWorkspace}
        actionHref="/dashboard"
      />
    </div>
  );
}
