"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5 tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-[#111827] border border-[#374151] rounded-2xl px-5 py-3.5
            text-[#E5E7EB] placeholder:text-[#6B7280] focus:outline-none
            transition-all duration-200
            focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/30
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-[#DC2626] focus:border-[#DC2626]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[#DC2626]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
