import { Flame } from "lucide-react";
import { ReactNode } from "react";

interface StartGameButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export function StartGameButton({ onClick, disabled, children, className = "" }: StartGameButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`group relative bg-brand-blood hover:bg-red-700 text-white font-serif text-xl font-bold tracking-widest px-12 py-4 rounded-full overflow-hidden shadow-[0_0_30px_rgba(159,18,57,0.4)] hover:shadow-[0_0_50px_rgba(159,18,57,0.6)] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
    >
      {!disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[drift_1s_ease-in-out]" />
      )}
      <span className="flex items-center justify-center gap-3 drop-shadow-md">
        <Flame className={`w-6 h-6 ${!disabled ? "animate-[flicker_2s_infinite]" : "opacity-50"}`} />
        {children}
      </span>
    </button>
  );
}
