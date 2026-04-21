"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { socketManger } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Scroll } from "lucide-react";

interface VoteSession {
  round: number;
  durationSec: number;
  candidates: string[];
  deadlineTimestamp: number;
}

interface VoteResult {
  round: number;
  counts: Record<string, number>;
  eliminatedId: string | null;
  tied: boolean;
}

export function VotePanel() {
  const { players, deadPlayers, roomId, myGuestId } = useGameStore();
  const [voteSession, setVoteSession] = useState<VoteSession | null>(null);
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const onVoteStarted = (data: any) => {
      setVoteSession({
        round: data.round,
        durationSec: data.durationSec,
        candidates: data.candidates,
        deadlineTimestamp: Date.now() + data.durationSec * 1000,
      });
      setHasVoted(false);
      setSelectedTarget(null);
      setVoteResult(null);
    };

    const onVoteResult = (data: any) => {
      setVoteResult(data);
    };

    socketManger.on("vote_started", onVoteStarted);
    socketManger.on("vote_result", onVoteResult);
    return () => {
      socketManger.off("vote_started", onVoteStarted);
      socketManger.off("vote_result", onVoteResult);
    };
  }, []);

  const handleVote = () => {
    if (!selectedTarget || hasVoted || !voteSession) return;
    socketManger.emit("vote", {
      roomId,
      round: voteSession.round,
      targetId: selectedTarget,
    });
    setHasVoted(true);
  };

  const isDead = myGuestId ? deadPlayers.includes(myGuestId) : false;

  // No active vote session
  if (!voteSession && !voteResult) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-sm border border-white/5 rounded-sm text-center">
        <Scroll className="w-12 h-12 text-text-muted animate-pulse mb-4" />
        <h3 className="font-display text-lg tracking-widest text-text-secondary uppercase mb-2">Đang chờ bỏ phiếu</h3>
        <p className="text-sm text-text-muted">Hãy thảo luận, sau đó cùng bỏ phiếu treo cổ kẻ tình nghi.</p>
      </div>
    );
  }

  // Show result
  if (voteResult) {
    const eliminatedPlayer = voteResult.eliminatedId
      ? players.find(p => p.guestId === voteResult.eliminatedId)
      : null;

    return (
      <div className="flex flex-col bg-black/40 backdrop-blur-sm border border-white/5 rounded-sm overflow-hidden">
        <div className="p-4 border-b border-bg-elevated/50 bg-bg-surface/50">
          <h3 className="font-display font-bold text-village-gold tracking-widest uppercase text-center">Kết Quả Bỏ Phiếu</h3>
        </div>
        <div className="p-6 space-y-4">
          {voteResult.tied ? (
            <div className="text-center py-4">
              <p className="text-2xl font-display text-village-gold mb-2">HOÀ PHIẾU!</p>
              <p className="text-sm text-text-muted">Không ai bị treo cổ lần này. Ma Sói vẫn còn ở đây...</p>
            </div>
          ) : eliminatedPlayer ? (
            <div className="text-center py-4">
              <p className="text-sm text-text-muted uppercase tracking-widest mb-2">Bị treo cổ</p>
              <p className="text-3xl font-display text-wolf-red mb-2">{eliminatedPlayer.displayName}</p>
              <p className="text-sm text-text-muted">Làng đã lên tiếng. Cầu mong họ đã chọn đúng...</p>
            </div>
          ) : (
            <div className="text-center py-4 text-text-muted">Không tìm thấy kết quả.</div>
          )}

          {/* Vote counts */}
          <div className="space-y-2 pt-4 border-t border-bg-elevated/30">
            {Object.entries(voteResult.counts)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([guestId, count]) => {
                const player = players.find(p => p.guestId === guestId);
                if (!player) return null;
                const isElim = guestId === voteResult.eliminatedId;
                const maxCount = Math.max(...Object.values(voteResult.counts) as number[]);
                const pct = maxCount > 0 ? ((count as number) / maxCount) * 100 : 0;
                return (
                  <div key={guestId} className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-24 truncate ${isElim ? 'text-wolf-red' : 'text-text-secondary'}`}>{player.displayName}</span>
                    <div className="flex-1 h-2 bg-bg-elevated rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-700 rounded-full ${isElim ? 'bg-wolf-red' : 'bg-village-gold/40'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-sm font-bold w-4 text-right ${isElim ? 'text-wolf-red' : 'text-text-muted'}`}>{count as number}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }

  // Active vote
  const candidatePlayers = players.filter(p => voteSession!.candidates.includes(p.guestId));

  return (
    <div className="flex flex-col bg-black/40 backdrop-blur-sm border border-village-gold/20 rounded-sm overflow-hidden shadow-[0_0_30px_rgba(243,156,18,0.1)]">
      <div className="p-4 border-b border-bg-elevated/50 bg-bg-surface/50 flex items-center justify-between">
        <h3 className="font-display font-bold text-village-gold tracking-widest uppercase">Bỏ Phiếu Treo Cổ</h3>
        <CountdownTimer deadlineTimestamp={voteSession.deadlineTimestamp} label="" className="scale-75 origin-right" />
      </div>

      <div className="p-4 space-y-4">
        {isDead ? (
          <div className="text-center py-4 text-text-muted italic text-sm">Người chết không có quyền bỏ phiếu.</div>
        ) : hasVoted ? (
          <div className="text-center py-8">
            <p className="text-xl font-display text-village-gold tracking-widest mb-2">ĐÃ BỎ PHIẾU</p>
            <p className="text-sm text-text-muted">Phiếu của bạn đã được ghi nhận. Đang chờ kết quả...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-text-secondary text-center">Chọn người bạn nghi ngờ là Ma Sói:</p>
            <div className="grid grid-cols-2 gap-3 max-h-52 overflow-y-auto custom-scrollbar p-1">
              {candidatePlayers.map(p => {
                const isMe = p.guestId === myGuestId;
                return (
                  <button
                    key={p.guestId}
                    disabled={isMe}
                    onClick={() => setSelectedTarget(p.guestId)}
                    className={`p-3 border rounded-sm transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed
                      ${selectedTarget === p.guestId
                        ? 'border-village-gold bg-village-gold/20 text-white'
                        : 'border-white/10 hover:border-village-gold/50 hover:bg-white/5 text-text-secondary'
                      }`}
                  >
                    <span className="text-sm font-bold truncate block">{p.displayName}</span>
                    {isMe && <span className="text-[10px] text-text-muted">(chính bạn)</span>}
                  </button>
                );
              })}
            </div>
            <Button
              variant="gold"
              className="w-full mt-2"
              disabled={!selectedTarget}
              onClick={handleVote}
            >
              Xác nhận Bỏ Phiếu
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
