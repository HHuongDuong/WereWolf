"use client";

import { useState, useRef, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { socketManger } from "@/lib/socket";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sun, Skull } from "lucide-react";

export function DayPanel() {
  const { chat, roomId, myGuestId, deadPlayers, myRole } = useGameStore();
  const [message, setMessage] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const isDead = myGuestId ? deadPlayers.includes(myGuestId) : false;

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chat.all]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isDead) return;

    socketManger.emit("chat_message", {
      roomId,
      channel: "all",
      content: message.trim()
    });
    
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-sm border border-white/5 rounded-sm shadow-2xl overflow-hidden min-h-[400px]">
      {/* Header */}
      <div className="p-4 border-b border-bg-elevated/50 flex items-center justify-between bg-bg-surface/50">
        <div className="flex items-center">
          <Sun className="w-5 h-5 text-village-gold mr-2" />
          <h3 className="font-display font-bold text-village-gold tracking-widest uppercase">Thảo Luận Làng</h3>
        </div>
        {isDead && (
          <div className="flex items-center text-xs text-wolf-red font-bold animate-pulse">
            <Skull className="w-4 h-4 mr-1" />
            BẠN ĐÃ CHẾT (KHÔNG THỂ CHAT)
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div 
        ref={chatScrollRef}
        className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4"
      >
        {chat.all.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted italic text-sm">
            Chưa có tin nhắn nào. Bắt đầu thảo luận để tìm ra bè lũ Ma Sói!
          </div>
        ) : (
          chat.all.map((msg, idx) => {
            const isMe = msg.senderName === "Me"; // You might want to match ID if backend provides senderId
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-text-muted mb-1 px-1 font-bold tracking-wider uppercase">
                  {msg.senderName}
                </span>
                <div className={`px-3 py-2 rounded-sm max-w-[80%] text-sm ${isMe ? 'bg-village-gold/20 text-white border border-village-gold/30' : 'bg-bg-elevated/80 text-text-secondary border border-white/5'}`}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSendMessage} 
        className="p-3 border-t border-bg-elevated/50 bg-bg-surface/80 flex items-center gap-2"
      >
        <Input 
          className="flex-1 bg-black/50 border-white/10 text-sm focus-visible:ring-village-gold/50 placeholder:text-text-muted/50"
          placeholder={isDead ? "người chết không thể nói..." : "Nhập tin nhắn phân trần..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isDead}
          maxLength={200}
        />
        <Button 
          type="submit" 
          variant="gold" 
          size="sm" 
          disabled={!message.trim() || isDead}
          className="shrink-0 px-3"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
