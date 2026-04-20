import { HTMLAttributes } from "react";

interface TypographyProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: "primary" | "secondary" | "muted";
  size?: "sm" | "base" | "lg" | "xl";
}

export function Typography({
  variant = "primary",
  size = "base",
  className,
  children,
  ...props
}: TypographyProps) {
  const styles = {
    primary: "text-[#E5E7EB]",
    secondary: "text-[#9CA3AF]",
    muted: "text-[#6B7280]",
  };

  const sizeStyles = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  return (
    <p
      className={`${styles[variant]} ${sizeStyles[size]} leading-relaxed ${className || ""}`}
      {...props}
    >
      {children}
    </p>
  );
}
