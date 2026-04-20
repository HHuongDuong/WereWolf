import { Message } from "./types";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const isWerewolfChat = message.channel === "werewolf";

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}>
      <div
        className={`
          max-w-[75%] px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed
          ${isOwn
            ? "bg-[#7C3AED] text-white rounded-br-none"
            : isWerewolfChat
              ? "bg-[#991B1B]/90 text-[#FEE2E2] border border-[#EF4444]/30 rounded-bl-none"
              : "bg-[#1F2937] text-[#E5E7EB] border border-white/10 rounded-bl-none"
          }
        `}
      >
        {!isOwn && message.sender && (
          <p className="text-xs opacity-70 mb-1 font-medium tracking-wide">
            {message.sender}
            {isWerewolfChat && <span className="ml-2 text-[#FCA5A5]">🐺</span>}
          </p>
        )}

        <p>{message.content}</p>

        <p className="text-[10px] opacity-60 mt-2 text-right">
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}
