"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isWerewolfChat?: boolean;
}

export function ChatInput({
  onSend,
  placeholder = "Type your message...",
  disabled = false,
  isWerewolfChat = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (disabled) return;
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="border-t border-slate-800 bg-black/60 p-4 backdrop-blur-md relative z-10">
      <div className="flex gap-3 relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            flex-1 bg-black/40 border border-slate-700/50 rounded-xl px-5 py-3
            text-slate-200 placeholder:text-slate-500 placeholder:font-accent placeholder:italic focus:outline-none focus:border-red-900/80 focus:shadow-[0_0_15px_rgba(153,27,27,0.3)]
            transition-all font-sans
            ${isWerewolfChat ? "focus:border-red-800 focus:shadow-[0_0_15px_rgba(153,27,27,0.4)]" : ""}
          `}
        />

        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          variant={isWerewolfChat ? "danger" : "primary"}
          className="font-serif tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
