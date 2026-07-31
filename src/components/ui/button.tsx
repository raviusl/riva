import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium tracking-tight whitespace-nowrap outline-none select-none transition-all duration-[var(--riva-motion)] ease-[var(--riva-ease)] focus-visible:ring-2 focus-visible:ring-white/15 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-white text-black hover:bg-white/92",
        outline:
          "rounded-full border-white/[0.08] bg-white/[0.03] text-white/80 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white",
        secondary:
          "rounded-full border border-white/[0.08] bg-white/[0.03] text-white/80 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white",
        ghost:
          "rounded-full text-white/55 hover:bg-white/[0.05] hover:text-white",
        destructive:
          "rounded-full bg-red-500/15 text-red-200 hover:bg-red-500/25 focus-visible:ring-red-400/25",
        link: "rounded-full text-white/80 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-5",
        xs: "h-7 gap-1 rounded-full px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-full px-4 text-[0.8125rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-6",
        icon: "size-9 rounded-xl",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-xl [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
