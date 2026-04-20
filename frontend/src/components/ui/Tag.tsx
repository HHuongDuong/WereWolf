import { ReactNode } from "react";

interface TagProps {
  children: ReactNode;
  color?: "purple" | "red" | "green" | "amber";
}

export function Tag({ children, color = "purple" }: TagProps) {
  const colors = {
    purple: "bg-[#7C3AED]/10 text-[#C4B5FD] border border-[#7C3AED]/30",
    red: "bg-[#DC2626]/10 text-[#FCA5A5] border border-[#DC2626]/30",
    green: "bg-[#16A34A]/10 text-[#86EFAC] border border-[#16A34A]/30",
    amber: "bg-[#F59E0B]/10 text-[#FDE68C] border border-[#F59E0B]/30",
  };

  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-medium tracking-wider rounded-xl ${colors[color]}`}
    >
      {children}
    </span>
  );
}
