"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { SystemMessage } from "./SystemMessage";
import { Message } from "./types";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar"
    >
      {messages.map((msg, index) => (
        msg.type === "system" ? (
          <SystemMessage
            key={index}
            content={msg.content}
            type={msg.subtype}
          />
        ) : (
          <MessageBubble
            key={index}
            message={msg}
            isOwn={msg.isOwn || false}
          />
        )
      ))}
    </div>
  );
}
