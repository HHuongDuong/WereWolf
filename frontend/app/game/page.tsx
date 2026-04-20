"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { RoleReveal } from "@/components/ui/role-reveal";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { PlayerCard } from "@/components/ui/player-card";
import { Moon, Sun, Menu, MessageSquare } from "lucide-react";

export default function GamePage() {
  const router = useRouter();
  const { 
    roomStatus, 
    myRole, 
    roomId, 
    myGuestId,
    players, 
    phase, 
    round,
    deadlineTimestamp,
    deadPlayers,
    hostId
  } = useGameStore();

  // Route guarding
  useEffect(() => {
    if (roomStatus === "idle" || !roomId) {
      router.replace("/");
    } else if (roomStatus === "waiting") {
      router.replace("/lobby");
    }
  }, [roomStatus, roomId, router]);

  if (roomStatus !== "in_game") {
    return null; // Will redirect shortly
  }

  const isNight = phase === 'night';
  const themeClasses = isNight 
    ? "bg-night-blue/20" 
    : "bg-day-amber/20";

  return (
    <div className="relative min-h-screen bg-bg-base overflow-hidden flex flex-col font-body">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('/valid_background.jpg')] bg-cover bg-center opacity-[0.15] mix-blend-overlay pointer-events-none" />
      <div className={`absolute inset-0 transition-colors duration-2000 pointer-events-none ${themeClasses}`} />
      
      {/* Role Reveal Overlay (Will only show once due to internal logic) */}
      <RoleReveal role={myRole} roomId={roomId} onDismiss={() => {}} />

      {/* Header */}
      <header className="relative z-10 w-full h-16 border-b border-bg-elevated/80 bg-bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 shadow-md transition-colors duration-1000">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-full border border-white/10 ${isNight ? 'bg-night-purple/50 text-indigo-300' : 'bg-village-gold/20 text-village-gold'}`}>
            {isNight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-wider">
              {isNight ? 'MÀN ĐÊM' : 'BAN NGÀY'}
            </h1>
            <p className="text-xs text-text-muted uppercase font-bold tracking-widest">
              Vòng {round || 1}
            </p>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 top-4">
          {deadlineTimestamp && (
            <CountdownTimer deadlineTimestamp={deadlineTimestamp} label="" className="scale-75 origin-top" />
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-text-secondary hover:text-white transition-colors bg-bg-elevated/50 rounded-sm border border-white/5">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        
        {/* Play Area (Left / Center) */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
          
          <div className="max-w-2xl w-full text-center space-y-6">
            <h2 className="font-display text-3xl font-bold text-white tracking-widest drop-shadow-md">
              HÃY NHẮM MẮT LẠI...
            </h2>
            <p className="text-text-secondary font-body leading-relaxed max-w-lg mx-auto">
              Trò chơi đã bắt đầu. Hãy kiểm tra thẻ bài của bạn và chờ hệ thống phân bổ lượt đi. Đêm nay sẽ có người phải đổ máu.
            </p>
            
            {/* Action Panel Placeholder */}
            <div className="mt-10 p-8 rounded-sm border border-white/5 bg-black/40 backdrop-blur-sm shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center mb-4 text-text-muted animate-pulse">
                <MessageSquare className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm uppercase tracking-widest text-text-muted font-bold">
                Đang chờ hệ thống...
              </p>
            </div>
          </div>
          
        </main>

        {/* Sidebar (Right) - Player List */}
        <aside className="w-80 border-l border-bg-elevated/80 bg-bg-surface/50 backdrop-blur-sm flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
          <div className="p-4 border-b border-bg-elevated/50">
            <h3 className="text-sm font-display font-bold text-text-muted uppercase tracking-widest text-center">
              Dân Làng ({players.filter(p => !deadPlayers.includes(p.guestId)).length}/{players.length})
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {players.map((player) => {
              const isMe = player.guestId === myGuestId;
              const isDead = deadPlayers.includes(player.guestId);
              
              return (
                <div key={player.guestId} className={`relative transition-all duration-500 ${isDead ? 'opacity-40 grayscale' : 'hover:-translate-y-1'}`}>
                  <PlayerCard
                    displayName={player.displayName}
                    isHost={player.guestId === hostId}
                    isDead={isDead}
                  />
                  {/* Highlight current user slightly */}
                  {isMe && !isDead && (
                    <div className="absolute -inset-1 border border-village-gold/30 rounded-sm pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>
        </aside>
        
      </div>
    </div>
  );
}
