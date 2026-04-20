import { HTMLAttributes } from "react";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
  glow?: boolean;
}

export function Heading({
  level = 2,
  glow = false,
  className,
  children,
  ...props
}: HeadingProps) {
  const baseClasses = "font-bold tracking-wide text-[#E5E7EB]";

  const levelClasses = {
    1: "text-5xl md:text-6xl",
    2: "text-4xl md:text-5xl",
    3: "text-3xl md:text-4xl",
    4: "text-2xl md:text-3xl",
  };

  const glowClass = glow ? "drop-shadow-[0_0_15px_rgb(124,58,237)]" : "";
  const Component = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Component
      className={`${baseClasses} ${levelClasses[level]} ${glowClass} ${className || ""}`}
      {...props}
    >
      {children}
    </Component>
  );
}
