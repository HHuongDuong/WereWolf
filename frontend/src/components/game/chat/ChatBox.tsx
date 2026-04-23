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
    <Card className="h-[620px] flex flex-col overflow-hidden border-slate-800 bg-black/50 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-md">
      <div className="flex border-b border-slate-800 bg-black/60 relative z-10">
        <button
          onClick={() => setActiveTab("global")}
          className={`flex-1 py-4 font-serif tracking-[0.2em] text-xs transition-all uppercase ${
            activeTab === "global"
              ? "text-slate-200 border-b-2 border-red-900/80 bg-red-950/10 shadow-[inset_0_-20px_20px_-20px_rgba(153,27,27,0.2)]"
              : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
          }`}
        >
          Village Square
        </button>

        {isWerewolf && (
          <button
            onClick={() => setActiveTab("werewolf")}
            className={`flex-1 py-4 font-serif tracking-[0.2em] text-xs transition-all uppercase ${
              activeTab === "werewolf"
                ? "text-red-400 border-b-2 border-red-700 bg-red-950/20 shadow-[inset_0_-20px_20px_-20px_rgba(220,38,38,0.3)]"
                : "text-slate-600 hover:text-red-900/70 hover:bg-red-950/10"
            }`}
          >
            🐺 Wolf Den
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
