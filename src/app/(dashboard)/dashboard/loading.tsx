import { Loading } from "@/components/ui/loading";
import { uiZh } from "@/config/ui-zh";

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-24">
      <Loading label={uiZh.loadingEllipsis} className="text-white/55" />
    </div>
  );
}
