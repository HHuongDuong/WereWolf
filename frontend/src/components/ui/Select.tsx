"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5 tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full bg-[#111827] border border-[#374151] rounded-2xl px-5 py-3.5
            text-[#E5E7EB] focus:outline-none focus:border-[#7C3AED]
            focus:ring-2 focus:ring-[#7C3AED]/30 transition-all
            ${error ? "border-[#DC2626]" : ""}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-[#DC2626]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
