import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 text-sm text-white transition duration-[var(--riva-motion)] ease-[var(--riva-ease)] outline-none placeholder:text-white/30 focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/10 disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-red-400/50 aria-invalid:ring-2 aria-invalid:ring-red-400/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
