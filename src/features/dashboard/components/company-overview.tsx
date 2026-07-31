import Link from "next/link";
import { uiZh } from "@/config/ui-zh";

type OverviewStat = {
  label: string;
  value: number;
  href: string;
};

type CompanyOverviewProps = {
  workspaceName: string;
  companyName: string;
  stats: OverviewStat[];
};

export function CompanyOverview({
  workspaceName,
  companyName,
  stats,
}: CompanyOverviewProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-white">{uiZh.companyOverview}</h2>
          <p className="mt-1 text-xs text-white/45">
            <span className="text-white/70">{companyName}</span>
            <span className="mx-2 text-white/20">·</span>
            {workspaceName}
          </p>
        </div>
        <Link
          href="/dashboard/settings/company"
          className="text-xs text-white/45 hover:text-white/70"
        >
          {uiZh.companySettingsArrow}
        </Link>
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
