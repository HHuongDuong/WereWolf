"use client";

import { useEffect, useRef } from "react";

const commonEmojis = ["🌕", "🐺", "🔮", "🧙", "🛡️", "🏹", "☠️", "❤️", "💀", "🌑"];

interface EmojiPickerProps {
  isOpen: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ isOpen, onSelect, onClose }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-16 left-0 bg-[#111827] border border-white/10 rounded-3xl p-4 shadow-2xl grid grid-cols-5 gap-2 z-50"
    >
      {commonEmojis.map((emoji, i) => (
        <button
          key={i}
          onClick={() => onSelect(emoji)}
          className="text-3xl hover:scale-125 transition-transform p-2"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
