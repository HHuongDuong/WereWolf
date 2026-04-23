import { Message } from "./types";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const isWerewolfChat = message.channel === "werewolf";

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} group mb-1`}>
      <div
        className={`
          max-w-[75%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed relative
          ${isOwn
            ? "bg-gradient-to-br from-slate-800 to-slate-900 text-slate-200 border border-slate-700 rounded-tr-sm shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            : isWerewolfChat
              ? "bg-gradient-to-br from-red-950 to-black text-red-100 border border-red-900/50 rounded-tl-sm shadow-[0_4px_10px_rgba(153,27,27,0.2)]"
              : "bg-gradient-to-br from-black/80 to-slate-900/80 text-slate-300 border border-slate-800 rounded-tl-sm shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
          }
        `}
      >
        {!isOwn && message.sender && (
          <p className="text-[13px] opacity-80 mb-1 font-accent italic tracking-wide text-amber-500/80">
            {message.sender}
            {isWerewolfChat && <span className="ml-2 text-red-500/70 not-italic text-xs">🐺</span>}
          </p>
        )}

        <p className="font-sans whitespace-pre-wrap">{message.content}</p>

        <p className="text-[9px] opacity-40 mt-1.5 text-right font-serif tracking-widest uppercase">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
