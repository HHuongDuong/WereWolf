"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5 tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full bg-[#111827] border border-[#374151] rounded-2xl px-5 py-3.5
            text-[#E5E7EB] placeholder:text-[#6B7280] focus:outline-none
            transition-all duration-200 resize-y min-h-[120px]
            focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/30
            ${error ? "border-[#DC2626]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[#DC2626]">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
