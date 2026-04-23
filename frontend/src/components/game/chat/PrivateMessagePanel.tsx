"use client";

import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Message } from "./types";

interface PrivateMessagePanelProps {
  messages: Message[];
  onSend: (message: string) => void;
  inputDisabled?: boolean;
  placeholder?: string;
}

export function PrivateMessagePanel({ messages, onSend, inputDisabled = false, placeholder = "Speak to your pack..." }: PrivateMessagePanelProps) {
  return (
    <>
      <MessageList messages={messages} />
      <ChatInput
        onSend={onSend}
        placeholder={placeholder}
        isWerewolfChat={true}
        disabled={inputDisabled}
      />
    </>
  );
}
