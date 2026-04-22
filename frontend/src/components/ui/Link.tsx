import { AnchorHTMLAttributes } from "react";

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "primary" | "secondary";
  glow?: boolean;
}

export function Link({
  variant = "primary",
  glow = false,
  className,
  children,
  ...props
}: LinkProps) {
  const base = "transition-all duration-200 hover:underline";

  const variants = {
    primary: "text-[#7C3AED] hover:text-[#A78BFA]",
    secondary: "text-[#9CA3AF] hover:text-[#E5E7EB]",
  };

  const glowClass = glow ? "hover:drop-shadow-[0_0_8px_rgb(124,58,237)]" : "";

  return (
    <a className={`${base} ${variants[variant]} ${glowClass} ${className || ""}`} {...props}>
      {children}
    </a>
  );
}
