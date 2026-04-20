import { ReactNode } from "react";

type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

const variantStyles = {
  success: {
    border: "border-[#16A34A]/50",
    bg: "bg-[#16A34A]/5",
    icon: "🌿",
    text: "text-[#4ADE80]",
  },
  error: {
    border: "border-[#DC2626]/50",
    bg: "bg-[#DC2626]/5",
    icon: "☠️",
    text: "text-[#F87171]",
  },
  warning: {
    border: "border-[#F59E0B]/50",
    bg: "bg-[#F59E0B]/5",
    icon: "⚠️",
    text: "text-[#FCD34D]",
  },
  info: {
    border: "border-[#7C3AED]/50",
    bg: "bg-[#7C3AED]/5",
    icon: "🌕",
    text: "text-[#C4B5FD]",
  },
};

export function Alert({ variant = "info", title, children, onClose }: AlertProps) {
  const style = variantStyles[variant];

  return (
    <div
      className={`
        border rounded-3xl p-6 ${style.bg} ${style.border}
        shadow-lg relative overflow-hidden
      `}
    >
      <div className="flex gap-4">
        <div className={`text-4xl flex-shrink-0 ${style.text}`}>{style.icon}</div>

        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-bold tracking-wide text-lg mb-1 ${style.text}`}>
              {title}
            </h4>
          )}
          <div className="text-[#E5E7EB]/90 leading-relaxed">{children}</div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-white text-2xl leading-none self-start"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
