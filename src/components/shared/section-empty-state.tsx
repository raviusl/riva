import Link from "next/link";

import { brandBodyClassName } from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

type SectionEmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function SectionEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: SectionEmptyStateProps) {
  return (
    <div
      className={cn(
        "riva-surface-soft flex flex-col items-start gap-3 rounded-[var(--riva-radius-lg)] border-dashed px-5 py-8",
        className,
      )}
    >
      <div className="space-y-1.5">
        <p className="text-sm font-medium tracking-tight text-white/70">
          {title}
        </p>
        {description ? (
          <p className={brandBodyClassName}>{description}</p>
        ) : null}
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="text-sm font-medium text-white/70 underline-offset-4 transition duration-200 hover:text-white hover:underline"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
