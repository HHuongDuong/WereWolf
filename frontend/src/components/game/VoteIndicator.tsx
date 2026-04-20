import { Player } from "@/shared/types/game";

interface VoteIndicatorProps {
  player: Player;
  voteCount: number;
  isLeading?: boolean;
  maxVotes: number;
}

export function VoteIndicator({ player, voteCount, isLeading = false, maxVotes }: VoteIndicatorProps) {
  const percentage = maxVotes > 0 ? Math.round((voteCount / maxVotes) * 100) : 0;

  return (
    <div className={`relative p-4 rounded-2xl border transition-all ${isLeading ? "border-[#F59E0B] shadow-[0_0_20px_#F59E0B]" : "border-white/10"}`}>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-[#1F2937] ${!player.isAlive ? "grayscale opacity-60" : ""}`}>
            {player.name[0].toUpperCase()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-semibold ${!player.isAlive ? "line-through text-[#6B7280]" : ""}`}>
            {player.name}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-2 bg-[#374151] rounded-full overflow-hidden">
              <div
                className={`h-full ${isLeading ? "bg-[#F59E0B]" : "bg-[#7C3AED]"} transition-all`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="font-mono text-sm text-[#E5E7EB] tabular-nums">{voteCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
