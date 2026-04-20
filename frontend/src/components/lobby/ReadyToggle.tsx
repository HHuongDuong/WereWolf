"use client";

interface ReadyToggleProps {
  isReady: boolean;
  onChange?: (ready: boolean) => void;
  disabled?: boolean;
}

export function ReadyToggle({ isReady, onChange, disabled = false }: ReadyToggleProps) {
  return (
    <button
      onClick={() => !disabled && onChange?.(!isReady)}
      disabled={disabled}
      className={`
        px-5 py-2 rounded-2xl font-medium text-sm tracking-widest transition-all
        ${isReady
          ? "bg-[#16A34A] text-white"
          : "bg-[#1F2937] border border-[#4B5563] hover:border-[#16A34A]"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {isReady ? "✓ READY" : "READY UP"}
    </button>
  );
}
