"use client";

import { useState } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { PrivateMessagePanel } from "./PrivateMessagePanel";
import { Card } from "@/components/ui/Card";
import { Message } from "./types";
import { Role } from "@/shared/types/game";

interface ChatBoxProps {
  messages: Message[];
  werewolfMessages?: Message[];
  onSendMessage: (message: string, channel?: "global" | "werewolf") => void;
  currentRole?: Role | string;
  inputDisabled?: boolean;
}

export function ChatBox({
  messages,
  werewolfMessages = [],
  onSendMessage,
  currentRole,
  inputDisabled = false,
}: ChatBoxProps) {
  const [activeTab, setActiveTab] = useState<"global" | "werewolf">("global");
  const isWerewolf = currentRole === "WEREWOLF";

  return (
    <Card className="h-[620px] flex flex-col overflow-hidden border-white/10">
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab("global")}
          className={`flex-1 py-4 font-medium tracking-widest text-sm transition-all ${
            activeTab === "global"
              ? "text-[#E5E7EB] border-b-2 border-[#7C3AED]"
              : "text-[#9CA3AF]"
          }`}
        >
          VILLAGE SQUARE
        </button>

        {isWerewolf && (
          <button
            onClick={() => setActiveTab("werewolf")}
            className={`flex-1 py-4 font-medium tracking-widest text-sm transition-all ${
              activeTab === "werewolf"
                ? "text-[#FCA5A5] border-b-2 border-[#DC2626]"
                : "text-[#9CA3AF]"
            }`}
          >
            🐺 WOLF DEN
          </button>
        )}
      </div>

      {activeTab === "global" ? (
        <>
          <MessageList messages={messages} />
          <ChatInput onSend={(msg) => onSendMessage(msg, "global")} disabled={inputDisabled} />
        </>
      ) : (
        <PrivateMessagePanel
          messages={werewolfMessages}
          onSend={(msg) => onSendMessage(msg, "werewolf")}
          inputDisabled={inputDisabled}
        />
      )}
    </Card>
  );
}
