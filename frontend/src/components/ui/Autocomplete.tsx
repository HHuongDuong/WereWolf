"use client";

import { useState, useRef, useEffect } from "react";
import type React from "react";

interface AutocompleteProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function Autocomplete({ options, value, onChange, label, placeholder }: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState(options);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    onChange(input);
    setFiltered(options.filter((opt) => opt.toLowerCase().includes(input.toLowerCase())));
    setOpen(true);
  };

  return (
    <div className="relative" ref={ref}>
      {label && <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">{label}</label>}
      <input
        type="text"
        value={value}
        onChange={handleInput}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-[#111827] border border-[#374151] rounded-2xl px-5 py-3.5 text-[#E5E7EB] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/30"
      />

      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-[#111827] border border-[#374151] rounded-2xl py-2 shadow-2xl max-h-60 overflow-auto">
          {filtered.map((option) => (
            <div
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="px-5 py-3 hover:bg-[#1F2937] cursor-pointer text-[#E5E7EB]"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
