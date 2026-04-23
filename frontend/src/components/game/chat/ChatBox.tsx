"use client";

import { useState, useMemo } from "react";
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
  phase?: string;
  currentNightRole?: Role | null;
}

export function ChatBox({
  messages,
  werewolfMessages = [],
  onSendMessage,
  currentRole,
  inputDisabled = false,
  phase,
  currentNightRole,
}: ChatBoxProps) {
  const [activeTab, setActiveTab] = useState<"global" | "werewolf">("global");
  const isWerewolf = currentRole === "WEREWOLF";

  // Determine if each channel is disabled
  const isGlobalDisabled = useMemo(() => {
    // Global chat disabled during night phase
    return phase === "NIGHT";
  }, [phase]);

  const isWolvesDisabled = useMemo(() => {
    // Wolves chat only enabled during night when it's werewolf turn
    return phase !== "NIGHT" || currentNightRole !== Role.WEREWOLF;
  }, [phase, currentNightRole]);

  const currentInputDisabled = useMemo(() => {
    if (inputDisabled) return true;
    if (activeTab === "global") return isGlobalDisabled;
    if (activeTab === "werewolf") return isWolvesDisabled;
    return false;
  }, [inputDisabled, activeTab, isGlobalDisabled, isWolvesDisabled]);

  return (
    <Card className="h-[620px] flex flex-col overflow-hidden border-white/10">
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab("global")}
          disabled={isGlobalDisabled}
          className={`flex-1 py-4 font-medium tracking-widest text-sm transition-all ${
            activeTab === "global"
              ? "text-[#E5E7EB] border-b-2 border-[#7C3AED]"
              : "text-[#9CA3AF]"
          } ${isGlobalDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          VILLAGE SQUARE
          {isGlobalDisabled && <span className="ml-2 text-xs">(Closed)</span>}
        </button>

        {isWerewolf && (
          <button
            onClick={() => setActiveTab("werewolf")}
            disabled={isWolvesDisabled}
            className={`flex-1 py-4 font-medium tracking-widest text-sm transition-all ${
              activeTab === "werewolf"
                ? "text-[#FCA5A5] border-b-2 border-[#DC2626]"
                : "text-[#9CA3AF]"
            } ${isWolvesDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            🐺 WOLF DEN
            {isWolvesDisabled && <span className="ml-2 text-xs">(Closed)</span>}
          </button>
        )}
      </div>

      {activeTab === "global" ? (
        <>
          <MessageList messages={messages} />
          <ChatInput 
            onSend={(msg) => onSendMessage(msg, "global")} 
            disabled={currentInputDisabled}
            placeholder={isGlobalDisabled ? "Chat closed during night..." : "Type your message..."}
          />
        </>
      ) : (
        <PrivateMessagePanel
          messages={werewolfMessages}
          onSend={(msg) => onSendMessage(msg, "werewolf")}
          inputDisabled={currentInputDisabled}
          placeholder={isWolvesDisabled ? "Only during your night turn..." : "Type to your pack..."}
        />
      )}
    </Card>
  );
}
