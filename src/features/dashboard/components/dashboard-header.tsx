import { uiZh } from "@/config/ui-zh";
import { getGreeting } from "@/config/i18n";

type DashboardHeaderProps = {
  displayName: string;
  meetings: number;
  weddings: number;
  followUps: number;
  tasks: number;
};

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
      <p className="text-sm text-white/70">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white tabular-nums">
        {value}
      </p>
    </div>
  );
}

export function DashboardHeader({
  displayName,
  meetings,
  weddings,
  followUps,
  tasks,
}: DashboardHeaderProps) {
  const greeting = getGreeting();

  return (
    <header className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {greeting.zh}，{displayName}
        </h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm text-white/80">{uiZh.todayOverview}</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCell label={uiZh.todaysMeetings} value={meetings} />
          <StatCell label={uiZh.todaysWeddings} value={weddings} />
          <StatCell label={uiZh.followUpClients} value={followUps} />
          <StatCell label={uiZh.todaysTasks} value={tasks} />
        </div>
      </section>
    </header>
  );
}
