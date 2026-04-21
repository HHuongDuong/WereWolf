import { GameLayout } from "@/components/layout/GameLayout";
import { GamePhase } from "@/shared/types/game";

export default function GamePage() {
  return (
    <GameLayout phase={GamePhase.NIGHT} day={1}>
      <div className="rounded-3xl border border-white/10 bg-[#111827] p-8">
        <p className="text-[#9CA3AF]">
          Game page skeleton. Render board, actions, and chat here.
        </p>
      </div>
    </GameLayout>
  );
}
