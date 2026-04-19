import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "danger" | "ghost" | "gold"
  size?: "default" | "sm" | "lg"
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-sm font-body font-medium transition-all focus:outline-none focus:ring-2 focus:ring-wolf-red-glow focus:ring-offset-2 focus:ring-offset-bg-base disabled:opacity-50 disabled:pointer-events-none active:scale-95",
          {
            // Variants
            "bg-bg-elevated hover:bg-bg-surface text-text-primary border border-text-muted/30": variant === "default",
            "bg-wolf-red hover:bg-wolf-red-glow text-white shadow-lg shadow-wolf-red/30": variant === "danger",
            "bg-village-gold hover:bg-village-gold-glow text-bg-base shadow-lg shadow-village-gold/30": variant === "gold",
            "bg-transparent hover:bg-bg-elevated text-text-secondary hover:text-text-primary": variant === "ghost",

            // Sizes
            "h-10 px-4 py-2 text-sm": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-8 text-lg font-body font-bold tracking-wider": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
