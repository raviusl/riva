import type { ComponentProps } from "react";
import { Loader2Icon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { uiZh } from "@/config/ui-zh";
import { cn } from "@/lib/utils";

const loadingVariants = cva(
  "inline-flex items-center justify-center gap-2 text-muted-foreground",
  {
    variants: {
      size: {
        sm: "text-xs [&_svg]:size-3.5",
        default: "text-sm [&_svg]:size-4",
        lg: "text-base [&_svg]:size-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type LoadingProps = ComponentProps<"div"> &
  VariantProps<typeof loadingVariants> & {
    label?: string;
    fullPage?: boolean;
  };

function Loading({
  className,
  size,
  label = uiZh.loading,
  fullPage = false,
  ...props
}: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      data-slot="loading"
      className={cn(
        loadingVariants({ size }),
        fullPage && "flex min-h-[40vh] w-full",
        className,
      )}
      {...props}
    >
      <Loader2Icon className="animate-spin" aria-hidden />
      <span aria-hidden>{label}</span>
    </div>
  );
}

export { Loading, loadingVariants };
export type { LoadingProps };
