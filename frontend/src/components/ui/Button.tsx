"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "group relative px-6 py-3 rounded-2xl font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-[#7C3AED] text-white shadow-purple-500/40 hover:shadow-purple-500/60 hover:brightness-110",
        secondary: "bg-[#111827] border border-[#374151] text-[#E5E7EB] hover:bg-[#1F2937] hover:border-[#4B5563]",
        danger: "bg-[#DC2626] text-white shadow-red-500/40 hover:shadow-red-500/60 hover:brightness-110",
        success: "bg-[#16A34A] text-white shadow-green-500/40 hover:shadow-green-500/60 hover:brightness-110",
        ghost: "bg-transparent border border-[#9CA3AF]/30 text-[#E5E7EB] hover:bg-white/5",
        icon: "p-3 min-w-0",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3",
        lg: "px-8 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  icon?: ReactNode;
}

export function Button({
  className,
  variant,
  size,
  isLoading,
  icon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
      )}
      {!isLoading && icon && <span className="text-xl">{icon}</span>}
      {children}
    </button>
  );
}

export function IconButton({
  children,
  ...props
}: Omit<ButtonProps, "variant" | "size">) {
  return (
    <Button variant="icon" size="sm" {...props}>
      {children}
    </Button>
  );
}
