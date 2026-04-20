"use client";

import { HTMLAttributes } from "react";

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "purple" | "red" | "white";
}

export function Spinner({ size = "md", variant = "purple", className, ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const colorClasses = {
    purple: "border-[#7C3AED]",
    red: "border-[#DC2626]",
    white: "border-[#E5E7EB]",
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`} {...props}>
      <div
        className={`
          ${sizeClasses[size]} border-4 border-transparent rounded-full
          animate-spin
          ${colorClasses[variant]}
          border-t-current
          shadow-[0_0_20px_-2px] shadow-current
        `}
      />
    </div>
  );
}
