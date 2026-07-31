import { cn } from "@/lib/utils";
import type { BilingualText } from "@/config/i18n";

type BilingualProps = {
  text: BilingualText;
  className?: string;
  zhClassName?: string;
  /** @deprecated Project 073 — English secondary line removed (zh-CN only). */
  enClassName?: string;
  compact?: boolean;
};

/**
 * Project 073 — Simplified Chinese only.
 * Keeps the `BilingualText` shape for call-site compatibility; does not render English.
 */
export function Bilingual({
  text,
  className,
  zhClassName,
  compact = false,
}: BilingualProps) {
  const zh = text?.zh ?? "";

  return (
    <span className={cn(compact ? "text-sm font-medium" : "font-medium", className, zhClassName)}>
      {zh}
    </span>
  );
}
