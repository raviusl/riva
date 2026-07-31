import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { uiZh } from "@/config/ui-zh";

type TaskPersonDisplayProps = {
  label: string | null;
  emptyLabel?: string;
  className?: string;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function TaskPersonDisplay({
  label,
  emptyLabel = uiZh.unassigned,
  className,
}: TaskPersonDisplayProps) {
  if (!label?.trim()) {
    return (
      <span className={cn("text-sm text-white/45", className)}>
        {emptyLabel}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Avatar size="sm" className="bg-white/10 text-white">
        <AvatarFallback className="bg-white/10 text-[10px] text-white/80">
          {initials(label)}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm text-white/80">{label}</span>
    </span>
  );
}
