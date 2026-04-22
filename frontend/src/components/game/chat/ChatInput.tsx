"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmojiPicker } from "./EmojiPicker";

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
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = () => {
    if (disabled) return;
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (disabled) return;
    setMessage((prev) => prev + emoji);
    setShowEmoji(false);
  };

  return (
    <div className="border-t border-white/10 bg-[#111827] p-4">
      <div className="flex gap-3">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmoji(!showEmoji)}
            disabled={disabled}
            className="text-2xl"
          >
            🙂
          </Button>
          <EmojiPicker
            isOpen={showEmoji}
            onSelect={handleEmojiSelect}
            onClose={() => setShowEmoji(false)}
          />
        </div>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            flex-1 bg-[#1F2937] border border-white/10 rounded-2xl px-6 py-3.5
            text-[#E5E7EB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#7C3AED]
            ${isWerewolfChat ? "focus:border-[#DC2626]" : ""}
          `}
        />

        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          variant={isWerewolfChat ? "danger" : "primary"}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
