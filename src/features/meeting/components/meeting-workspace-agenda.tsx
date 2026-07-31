import { uiZh } from "@/config/ui-zh";
import type { MeetingAgendaItem } from "@/features/meeting/lib/meeting-types";

type MeetingWorkspaceAgendaProps = {
  items: MeetingAgendaItem[];
};

export function MeetingWorkspaceAgenda({ items }: MeetingWorkspaceAgendaProps) {
  const ordered = [...items].sort((a, b) => a.order - b.order);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-medium text-white">
          {uiZh.agendaCount(ordered.length)}
        </h2>
        <p className="mt-1 text-xs text-white/45">{uiZh.agendaDesc}</p>
      </div>

      {ordered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center">
          <p className="text-sm text-white/45">{uiZh.noAgendaYet}</p>
        </div>
      ) : (
        <ol className="space-y-3">
          {ordered.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 sm:px-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-xs text-white/60">
                  {item.order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {item.durationMinutes
                      ? uiZh.minutesShort(item.durationMinutes)
                      : uiZh.durationTbd}
                    {item.notes ? ` · ${item.notes}` : ""}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
