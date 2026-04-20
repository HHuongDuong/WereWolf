import { Player } from "@/shared/types/game";

interface StatsBoardProps {
  players: Player[];
  winner: "VILLAGE" | "WEREWOLVES" | null;
}

export function StatsBoard({ players, winner }: StatsBoardProps) {
  const alivePlayers = players.filter((p) => p.isAlive);
  const deadPlayers = players.filter((p) => !p.isAlive);

  return (
    <div className="max-w-4xl mx-auto bg-[#111827] rounded-3xl p-10">
      <h3 className="text-2xl font-bold mb-8 tracking-wide text-center">GAME STATISTICS</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-black/40 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-3">🏆</div>
          <div className="text-[#E5E7EB] text-xl font-semibold">WINNER</div>
          <div className={`text-3xl font-black mt-2 ${winner === "VILLAGE" ? "text-[#4ADE80]" : "text-[#F87171]"}`}>
            {winner}
          </div>
        </div>

        <div className="bg-black/40 rounded-2xl p-6">
          <div className="text-[#16A34A] text-sm tracking-widest mb-4">SURVIVORS ({alivePlayers.length})</div>
          <ul className="space-y-3">
            {alivePlayers.map((p) => (
              <li key={p.id} className="flex justify-between text-[#E5E7EB]">
                <span>{p.name}</span>
                <span className="text-xs opacity-60">{p.role}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-black/40 rounded-2xl p-6">
          <div className="text-[#DC2626] text-sm tracking-widest mb-4">FALLEN ({deadPlayers.length})</div>
          <ul className="space-y-3">
            {deadPlayers.map((p) => (
              <li key={p.id} className="flex justify-between text-[#9CA3AF] line-through">
                <span>{p.name}</span>
                <span className="text-xs opacity-60">{p.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
