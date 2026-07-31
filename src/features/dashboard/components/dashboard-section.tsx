import Link from "next/link";

import type { ReactNode } from "react";

type DashboardSectionProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
};

export function DashboardSection({
  title,
  description,
  actionHref,
  actionLabel,
  children,
}: DashboardSectionProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-white">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs text-white/45">{description}</p>
          ) : null}
        </div>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="shrink-0 text-xs text-white/45 hover:text-white/70"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
