"use client";

import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { Trophy, Users } from "lucide-react";

export function EndGameScreen() {
  const router = useRouter();
  const { winnerTeam, finalRoles, players, reset } = useGameStore();

  const handleBackToHome = () => {
    reset();
    router.push("/");
  };

  const isWerewolfWin = winnerTeam === 'werewolf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base">
      <div className="absolute inset-0 bg-[url('/valid_background.jpg')] bg-cover bg-center opacity-[0.15] mix-blend-overlay" />
      
      <div className="relative z-10 max-w-2xl w-full mx-4">
        <div className="bg-bg-surface/90 backdrop-blur-md border border-white/10 rounded-sm p-8 shadow-2xl">
          
          {/* Winner Announcement */}
          <div className="flex flex-col items-center mb-8">
            <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mb-4 ${
              isWerewolfWin 
                ? 'border-danger-red/50 text-danger-red' 
                : 'border-village-gold/50 text-village-gold'
            }`}>
              <Trophy className="w-10 h-10" />
            </div>
            
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              {isWerewolfWin ? 'Ma Sói Thắng!' : 'Dân Làng Thắng!'}
            </h1>
            
            <p className="text-text-muted text-center">
              {isWerewolfWin 
                ? 'Ma Sói đã tiêu diệt hết dân làng' 
                : 'Dân làng đã loại bỏ tất cả Ma Sói'}
            </p>
          </div>

          {/* Player Roles Reveal */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-text-muted mr-2" />
              <h2 className="text-lg font-display font-bold text-white">
                Vai trò của mọi người
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              {players.map((player) => {
                const role = finalRoles?.[player.guestId] || 'UNKNOWN';
                const isWerewolf = role === 'WEREWOLF';
                
                return (
                  <div
                    key={player.guestId}
                    className={`p-3 rounded-sm border ${
                      isWerewolf 
                        ? 'border-danger-red/30 bg-danger-red/10' 
                        : 'border-white/10 bg-bg-elevated/50'
                    }`}
                  >
                    <p className="text-sm font-medium text-white truncate">
                      {player.displayName}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isWerewolf ? 'text-danger-red' : 'text-text-muted'
                    }`}>
                      {role}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Back to Home Button */}
          <button
            onClick={handleBackToHome}
            className="w-full py-3 bg-village-gold text-bg-base rounded-sm font-bold uppercase tracking-wider hover:bg-village-gold/90 transition-all"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
