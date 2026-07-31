import { AppEmptyState } from "@/components/layout/app-empty-state";
import { Badge } from "@/components/ui/badge";
import { uiZh } from "@/config/ui-zh";
import type { Tables, WeddingStatus } from "@/types/database";

const statusLabel: Record<WeddingStatus, string> = {
  inquiry: uiZh.weddingStatusInquiry,
  confirmed: uiZh.confirmed,
  in_progress: uiZh.inProgress,
  completed: uiZh.completed,
  cancelled: uiZh.cancelled,
};

type WeddingCardProps = {
  weddings: Tables<"weddings">[];
};

export function WeddingCard({ weddings }: WeddingCardProps) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h2 className="text-sm text-white/85">{uiZh.upcomingWeddings}</h2>

      {weddings.length === 0 ? (
        <div className="mt-4">
          <AppEmptyState />
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.05]">
          <div className="grid grid-cols-[1.4fr_0.9fr_1fr_0.8fr] gap-2 border-b border-white/[0.05] bg-white/[0.03] px-3 py-2 text-[11px] text-white/40">
            <span>{uiZh.weddingName}</span>
            <span>{uiZh.date}</span>
            <span>{uiZh.venue}</span>
            <span>{uiZh.status}</span>
          </div>
          <ul className="divide-y divide-white/[0.05]">
            {weddings.map((wedding) => {
              const status = statusLabel[wedding.status];
              return (
                <li
                  key={wedding.id}
                  className="grid grid-cols-[1.4fr_0.9fr_1fr_0.8fr] items-center gap-2 px-3 py-3 text-sm"
                >
                  <span className="truncate font-medium text-white/90">
                    {wedding.name}
                  </span>
                  <span className="tabular-nums text-white/60">
                    {wedding.wedding_date}
                  </span>
                  <span className="truncate text-white/55">
                    {wedding.venue ?? uiZh.emDash}
                  </span>
                  <Badge
                    variant="secondary"
                    className="w-fit border-white/10 bg-white/[0.06] text-[11px] text-white/75"
                  >
                    {status}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
