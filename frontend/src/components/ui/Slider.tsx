"use client";

import { useState } from "react";
import type React from "react";

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  label?: string;
}

export function Slider({ min = 0, max = 100, step = 1, value = 50, onChange, label }: SliderProps) {
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setCurrentValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#9CA3AF]">{label}</span>
          <span className="text-[#E5E7EB] font-medium">{currentValue}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        className="w-full accent-[#7C3AED] bg-[#374151] h-2 rounded-full cursor-pointer"
      />
    </div>
  );
}
