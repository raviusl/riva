import Link from "next/link";

type OverviewStat = {
  label: string;
  value: number;
  href: string;
};

type MvpOverviewProps = {
  workspaceName: string;
  companyName: string;
  stats: OverviewStat[];
};

/**
 * @deprecated Legacy CRM dashboard overview — do not use on Workspace home.
 * Daily Workspace lives in `command-center-home.tsx`.
 */
export function MvpOverview({
  workspaceName,
  companyName,
  stats,
}: MvpOverviewProps) {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl text-white sm:text-2xl">RIVA Workspace</h1>
        <p className="mt-2 text-sm text-white/45">
          <span className="text-white/70">{workspaceName}</span>
          <span className="mx-2 text-white/20">·</span>
          <span className="text-white/70">{companyName}</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 transition-colors hover:bg-white/[0.05]"
          >
            <p className="text-xs text-white/45">{stat.label}</p>
            <p className="mt-2 text-2xl font-medium tracking-tight text-white">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
