"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  title?: string;
}

export function Popover({ trigger, children, title }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 z-50 w-80"
          >
            <div
              className="
                bg-[#111827] border border-[#7C3AED]/40 rounded-3xl
                shadow-2xl shadow-purple-950/50 p-6
              "
            >
              {title && (
                <div className="font-bold text-lg text-[#E5E7EB] mb-4 tracking-wide border-b border-white/10 pb-4">
                  {title}
                </div>
              )}
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
