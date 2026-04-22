"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            className={`
              peer w-6 h-6 accent-[#7C3AED] bg-[#111827] border-2 border-[#374151]
              rounded-xl appearance-none cursor-pointer
              checked:border-[#7C3AED] checked:bg-[#7C3AED]
              transition-all duration-200
              ${className}
            `}
            {...props}
          />
          <div className="absolute inset-0 flex items-center justify-center text-white scale-0 peer-checked:scale-100 transition-transform">
            ✓
          </div>
        </div>
        {label && (
          <span className="text-[#E5E7EB] group-hover:text-white transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
