"use client";

import { useState } from "react";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({ checked = false, onCheckedChange, label, disabled }: SwitchProps) {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onCheckedChange?.(newValue);
  };

  return (
    <label className={`flex items-center gap-3 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <div
        onClick={handleToggle}
        className={`
          relative w-14 h-7 rounded-full transition-all duration-300
          ${isChecked ? "bg-[#7C3AED]" : "bg-[#374151]"}
        `}
      >
        <div
          className={`
            absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300
            ${isChecked ? "translate-x-8" : "translate-x-1"}
          `}
        />
      </div>
      {label && <span className="text-[#E5E7EB]">{label}</span>}
    </label>
  );
}
