"use client";

import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Card } from "@/components/ui/Card";
import { Message } from "./types";

interface PrivateMessagePanelProps {
  messages: Message[];
  onSend: (message: string) => void;
  inputDisabled?: boolean;
}

export function PrivateMessagePanel({ messages, onSend, inputDisabled = false }: PrivateMessagePanelProps) {
  return (
    <Card className="h-[520px] flex flex-col border-[#DC2626]/30">
      <div className="px-6 py-4 border-b border-[#DC2626]/30 flex items-center gap-3 bg-[#991B1B]/10">
        <span className="text-2xl">🐺</span>
        <div>
          <p className="font-bold text-[#FCA5A5]">Werewolf Den</p>
          <p className="text-xs text-[#F87171]">Only your pack can see this</p>
        </div>
      </div>

      <MessageList messages={messages} />

      <ChatInput
        onSend={onSend}
        placeholder="Speak to your pack..."
        isWerewolfChat={true}
        disabled={inputDisabled}
      />
    </Card>
  );
}
