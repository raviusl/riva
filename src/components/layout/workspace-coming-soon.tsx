import { uiZh } from "@/config/ui-zh";

type WorkspaceComingSoonProps = {
  title: string;
  description?: string;
};

export function WorkspaceComingSoon({
  title,
  description = uiZh.moduleNotAvailable,
}: WorkspaceComingSoonProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center">
      <p className="text-sm font-medium text-white/80">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-white/45">
        {uiZh.comingSoonTitle}
      </p>
      <p className="mx-auto mt-3 max-w-sm text-xs text-white/35">{description}</p>
    </div>
  );
}
