"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useGameSocketEmit } from "@/hooks/useGameSocket";
import { Crosshair } from "lucide-react";

export function HunterModal() {
  const { players, deadPlayers, myGuestId } = useGameStore();
  const { emit } = useGameSocketEmit();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [actionSent, setActionSent] = useState(false);

  const alivePlayers = players.filter(p => !deadPlayers.includes(p.guestId) && p.guestId !== myGuestId);

  const handleSubmit = () => {
    if (!selectedTarget || actionSent) return;

    emit('hunter_shoot', {
      targetId: selectedTarget,
    });

    setActionSent(true);
  };

  if (actionSent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-bg-surface border border-danger-red/50 rounded-sm p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-green-500/50 flex items-center justify-center mb-4 text-green-400">
              <Crosshair className="w-8 h-8" />
            </div>
            <p className="text-sm uppercase tracking-widest text-green-400 font-bold">
              Mục tiêu đã được chọn
            </p>
            <p className="text-xs text-text-muted mt-2 text-center">
              Bạn đã sử dụng kỹ năng Thợ Săn
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-bg-surface border border-danger-red/50 rounded-sm p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-full border-2 border-danger-red/50 flex items-center justify-center text-danger-red">
            <Crosshair className="w-8 h-8" />
          </div>
        </div>

        <h3 className="text-xl font-display font-bold text-center mb-2 text-white">
          Kỹ năng Thợ Săn
        </h3>
        <p className="text-xs text-text-muted text-center mb-6">
          Bạn đã chết! Chọn một người để kéo theo
        </p>

        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar mb-6">
          {alivePlayers.map((player) => (
            <button
              key={player.guestId}
              onClick={() => setSelectedTarget(player.guestId)}
              className={`p-3 rounded-sm border transition-all ${
                selectedTarget === player.guestId
                  ? 'border-danger-red bg-danger-red/20 text-white'
                  : 'border-white/10 bg-bg-elevated/50 text-text-secondary hover:border-white/30 hover:text-white'
              }`}
            >
              <p className="text-sm font-medium truncate">{player.displayName}</p>
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedTarget}
          className={`w-full py-3 rounded-sm font-bold uppercase tracking-wider transition-all ${
            selectedTarget
              ? 'bg-danger-red text-white hover:bg-danger-red/90'
              : 'bg-bg-elevated text-text-muted cursor-not-allowed'
          }`}
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
}
