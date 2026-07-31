import Link from "next/link";

import { AppEmptyState } from "@/components/layout/app-empty-state";
import { uiZh } from "@/config/ui-zh";

export function FeaturePlaceholder({ title }: { title: string }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <h1 className="text-xl text-white">{title}</h1>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
        <AppEmptyState
          title={uiZh.comingSoon}
          description={uiZh.comingSoonModuleHint}
        />
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/[0.05]"
          >
            {uiZh.dashboard}
          </Link>
          <Link
            href="/dashboard/projects"
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            {uiZh.projects}
          </Link>
        </div>
      </div>
    </div>
  );
}
