import type { ReactNode } from "react";

type SettingsSectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SettingsSectionCard({
  title,
  description,
  children,
}: SettingsSectionCardProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="mb-4">
        <h2 className="text-sm font-medium text-white">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs text-white/45">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
