import { Player } from "@/shared/types/game";

interface StatsBoardProps {
  players: Player[];
  winner: "VILLAGE" | "WEREWOLVES" | null;
}

const winnerInfo = {
  VILLAGE: {
    label: "VILLAGE",
    color: "from-[#4ADE80] to-[#166534]",
    icon: "🌿",
    desc: "The light prevails. Villagers have survived the nightmare!",
    border: "border-[#4ADE80]",
  },
  WEREWOLVES: {
    label: "WEREWOLF",
    color: "from-[#F87171] to-[#7F1D1D]",
    icon: "🐺",
    desc: "The darkness devours all. Werewolves reign supreme!",
    border: "border-[#F87171]",
  },
};

export function StatsBoard({ players, winner }: StatsBoardProps) {
  const alivePlayers = players.filter((p) => p.isAlive);
  const deadPlayers = players.filter((p) => !p.isAlive);

  const winnerTheme = winner ? winnerInfo[winner] : null;

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#18122B] to-[#2D1E3C] rounded-3xl p-10 border-4 border-[#312244] shadow-[0_0_40px_#000a] relative overflow-hidden">
      <h3 className="text-3xl font-black mb-8 tracking-widest text-center text-[#E0E7FF] drop-shadow-lg font-serif">
        GAME STATISTICS
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Winner Panel */}
        <div
          className={`rounded-2xl p-6 text-center border-2 ${winnerTheme?.border || "border-[#64748B]"} bg-gradient-to-b ${winnerTheme?.color || "from-[#334155] to-[#1E293B]"} shadow-[0_0_24px_#000b] flex flex-col items-center justify-center min-h-[220px]`}
        >
          <div className="text-6xl mb-2 animate-pulse drop-shadow-lg">{winnerTheme?.icon || "?"}</div>
          <div className="text-[#E0E7FF] text-xl font-bold tracking-widest mb-1 font-serif">WINNER</div>
          <div className="text-4xl font-black mt-1 mb-2 drop-shadow-lg font-serif uppercase tracking-wider">
            {winnerTheme?.label || "-"}
          </div>
          <div className="text-xs text-[#C7D2FE] italic mt-1 opacity-80 font-mono">
            {winnerTheme?.desc || "Who will survive the next night?"}
          </div>
        </div>

        {/* Survivors Panel */}
        <div className="rounded-2xl p-6 border-2 border-[#16A34A]/60 bg-gradient-to-b from-[#232D1A] to-[#1A2E23] shadow-[0_0_16px_#000a]">
          <div className="text-[#A7F3D0] text-base tracking-widest mb-4 font-bold flex items-center gap-2">
            <span className="text-2xl">🛡️</span> SURVIVORS <span>({alivePlayers.length})</span>
          </div>
          <ul className="space-y-3">
            {alivePlayers.length === 0 ? (
              <li className="text-[#64748B] italic text-center">No one survived this night...</li>
            ) : (
              alivePlayers.map((p) => (
                <li key={p.id} className="flex justify-between text-[#E0E7FF] font-mono bg-[#1E293B]/60 rounded-lg px-3 py-1 shadow-sm border border-[#64748B]/30">
                  <span className="font-bold tracking-wide">{p.name}</span>
                  <span className="text-xs opacity-70 uppercase">{p.role}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Fallen Panel */}
        <div className="rounded-2xl p-6 border-2 border-[#DC2626]/60 bg-gradient-to-b from-[#2B1A1A] to-[#231A2E] shadow-[0_0_16px_#000a]">
          <div className="text-[#FCA5A5] text-base tracking-widest mb-4 font-bold flex items-center gap-2">
            <span className="text-2xl">🪦</span> FALLEN <span>({deadPlayers.length})</span>
          </div>
          <ul className="space-y-3">
            {deadPlayers.length === 0 ? (
              <li className="text-[#64748B] italic text-center">No one has fallen... yet.</li>
            ) : (
              deadPlayers.map((p) => (
                <li key={p.id} className="flex justify-between text-[#9CA3AF] line-through font-mono bg-[#1E293B]/40 rounded-lg px-3 py-1 border border-[#64748B]/20">
                  <span className="font-bold tracking-wide">{p.name}</span>
                  <span className="text-xs opacity-60 uppercase">{p.role}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Decorative overlay for fantasy vibe */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-radial from-[#A21CAF]/40 to-transparent rounded-full blur-2xl opacity-40 animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-radial from-[#F59E42]/30 to-transparent rounded-full blur-2xl opacity-30 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-[#312244]/60 to-transparent rounded-full blur-3xl opacity-20" />
      </div>
    </div>
  );
}
