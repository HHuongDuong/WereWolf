import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ glow = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-[#111827] border border-white/10 rounded-3xl p-6 shadow-xl
        ${glow ? "shadow-purple-500/30" : ""}
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
