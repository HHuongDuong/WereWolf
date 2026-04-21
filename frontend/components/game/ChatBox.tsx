"use client";

import { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { useGameSocketEmit } from "@/hooks/useGameSocket";
import { Send, Users, Moon } from "lucide-react";

export function ChatBox() {
  const { chat, myRole, phase } = useGameStore();
  const { emit } = useGameSocketEmit();
  const [message, setMessage] = useState("");
  const [activeChannel, setActiveChannel] = useState<'all' | 'wolves'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isWerewolf = myRole?.toUpperCase() === 'WEREWOLF';
  const isNight = phase === 'night';

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.all, chat.wolves]);

  const handleSend = () => {
    if (!message.trim()) return;

    emit('chat_message', {
      channel: activeChannel,
      content: message.trim(),
    });

    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentMessages = activeChannel === 'all' ? chat.all : chat.wolves;

  return (
    <div className="flex flex-col h-full bg-bg-surface/50 backdrop-blur-sm border-t border-bg-elevated/80">
      {/* Channel Tabs */}
      <div className="flex border-b border-bg-elevated/50">
        <button
          onClick={() => setActiveChannel('all')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
            activeChannel === 'all'
              ? 'bg-bg-elevated/50 text-white border-b-2 border-village-gold'
              : 'text-text-muted hover:text-white hover:bg-bg-elevated/30'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tất cả</span>
        </button>

        {isWerewolf && (
          <button
            onClick={() => setActiveChannel('wolves')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeChannel === 'wolves'
                ? 'bg-bg-elevated/50 text-danger-red border-b-2 border-danger-red'
                : 'text-text-muted hover:text-danger-red hover:bg-bg-elevated/30'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Ma Sói</span>
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {currentMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-text-muted text-center">
              {activeChannel === 'wolves' && !isNight
                ? 'Kênh Ma Sói chỉ mở vào ban đêm'
                : 'Chưa có tin nhắn nào'}
            </p>
          </div>
        ) : (
          currentMessages.map((msg, idx) => (
            <div key={idx} className="flex flex-col space-y-1">
              <div className="flex items-baseline space-x-2">
                <span className={`text-xs font-bold ${
                  activeChannel === 'wolves' ? 'text-danger-red' : 'text-village-gold'
                }`}>
                  {msg.senderName}
                </span>
                <span className="text-[10px] text-text-muted">
                  {new Date(msg.sentAt).toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <p className="text-sm text-text-primary break-words">
                {msg.content}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-bg-elevated/50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              activeChannel === 'wolves' && !isNight
                ? 'Kênh Ma Sói đã đóng'
                : 'Nhập tin nhắn...'
            }
            disabled={activeChannel === 'wolves' && !isNight}
            maxLength={200}
            className="flex-1 px-3 py-2 bg-bg-elevated border border-white/10 rounded-sm text-sm text-white placeholder-text-muted focus:outline-none focus:border-village-gold/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || (activeChannel === 'wolves' && !isNight)}
            className={`px-4 py-2 rounded-sm transition-all ${
              message.trim() && !(activeChannel === 'wolves' && !isNight)
                ? 'bg-village-gold text-bg-base hover:bg-village-gold/90'
                : 'bg-bg-elevated text-text-muted cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-text-muted mt-1">
          {message.length}/200 ký tự
        </p>
      </div>
    </div>
  );
}
