import { brandLabelClassName } from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

type WorkspaceSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
};

export function WorkspaceSection({
  title,
  children,
  className,
  action,
}: WorkspaceSectionProps) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex items-end justify-between gap-3">
        <h2 className={brandLabelClassName}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
