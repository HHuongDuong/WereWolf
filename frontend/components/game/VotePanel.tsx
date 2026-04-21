"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useGameSocketEmit } from "@/hooks/useGameSocket";
import { Vote } from "lucide-react";

export function VotePanel() {
  const { players, deadPlayers, myGuestId, round } = useGameStore();
  const { emit } = useGameSocketEmit();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [voteSent, setVoteSent] = useState(false);

  const alivePlayers = players.filter(p => !deadPlayers.includes(p.guestId) && p.guestId !== myGuestId);

  const handleSubmit = () => {
    if (!selectedTarget || voteSent) return;

    emit('vote', {
      round,
      targetId: selectedTarget,
    });

    setVoteSent(true);
  };

  if (voteSent) {
    return (
      <div className="mt-10 p-8 rounded-sm border border-green-500/30 bg-black/40 backdrop-blur-sm shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full border-2 border-green-500/50 flex items-center justify-center mb-4 text-green-400">
          <Vote className="w-8 h-8" />
        </div>
        <p className="text-sm uppercase tracking-widest text-green-400 font-bold">
          Vote đã được ghi nhận
        </p>
        <p className="text-xs text-text-muted mt-2">
          Chờ người chơi khác vote...
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 p-8 rounded-sm border border-danger-red/30 bg-black/40 backdrop-blur-sm shadow-2xl min-h-[300px]">
      <div className="flex items-center justify-center mb-6">
        <div className="w-12 h-12 rounded-full border-2 border-danger-red/50 flex items-center justify-center text-danger-red">
          <Vote className="w-8 h-8" />
        </div>
      </div>

      <h3 className="text-xl font-display font-bold text-center mb-2 text-white">
        Bỏ phiếu treo cổ
      </h3>
      <p className="text-xs text-text-muted text-center mb-6">
        Chọn người bạn nghi ngờ là Ma Sói
      </p>

      <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
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
        className={`mt-6 w-full py-3 rounded-sm font-bold uppercase tracking-wider transition-all ${
          selectedTarget
            ? 'bg-danger-red text-white hover:bg-danger-red/90'
            : 'bg-bg-elevated text-text-muted cursor-not-allowed'
        }`}
      >
        Bỏ phiếu
      </button>
    </div>
  );
}
