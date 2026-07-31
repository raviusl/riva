import { WorkspaceSection } from "@/components/shared/workspace-section";
import { uiZh } from "@/config/ui-zh";

type AiInsightCardProps = {
  message: string;
};

/**
 * AI Daily Brief — one calm card. Placeholder copy only; no AI logic.
 */
export function AiInsightCard({ message }: AiInsightCardProps) {
  return (
    <WorkspaceSection title={uiZh.aiDailyBrief}>
      <div className="riva-surface rounded-[var(--riva-radius-xl)] px-7 py-8 sm:px-8 sm:py-9">
        <p className="text-[11px] font-medium tracking-[0.14em] text-white/30 uppercase">
          {uiZh.brief}
        </p>
        <p className="mt-4 max-w-md text-lg leading-relaxed tracking-[-0.02em] text-white/80 sm:text-xl">
          {message}
        </p>
      </div>
    </WorkspaceSection>
  );
}
