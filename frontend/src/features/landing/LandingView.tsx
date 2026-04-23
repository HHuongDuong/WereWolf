"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StartGameButton } from "@/components/lobby/StartGameButton";
import { PlayerIdentityGate } from "@/features/lobby/set-player-name/ui/PlayerIdentityGate";
import { useLobbyStore } from "@/entities/room/model/lobbyStore";

export default function LandingView() {
  const router = useRouter();
  const playerName = useLobbyStore((state) => state.playerName);
  const setPlayerName = useLobbyStore((state) => state.setPlayerName);
  const [nameInput, setNameInput] = useState("");

  if (!playerName) {
    return (
      <PlayerIdentityGate
        nameInput={nameInput}
        onNameInputChange={setNameInput}
        onConfirm={() => {
          if (nameInput.trim()) {
            setPlayerName(nameInput.trim());
          }
        }}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative z-10 px-8">
      {/* Game Rules Section */}
      <div className="max-w-4xl w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <h1 className="text-4xl font-serif text-brand-moonlight mb-6 text-center tracking-wider">
          🌕 Werewolf Online 🐺
        </h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              📜 Game Overview
            </h2>
            <p className="leading-relaxed">
              Werewolf is a social deduction game where players are secretly assigned roles as either Villagers or Werewolves. 
              The Villagers must identify and eliminate the Werewolves before they're all killed, while the Werewolves try to 
              eliminate the Villagers without being discovered.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              🎭 Roles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                <h3 className="text-lg font-bold text-red-400 mb-2">🐺 Werewolf</h3>
                <p className="text-sm">Eliminate villagers at night. Work together with other werewolves.</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                <h3 className="text-lg font-bold text-blue-400 mb-2">👁️ Seer</h3>
                <p className="text-sm">Check one player's identity each night to find werewolves.</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                <h3 className="text-lg font-bold text-green-400 mb-2">🛡️ Guard</h3>
                <p className="text-sm">Protect one player from werewolf attacks each night.</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                <h3 className="text-lg font-bold text-purple-400 mb-2">🧪 Witch</h3>
                <p className="text-sm">Use a healing potion to save or a poison potion to kill once per game.</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                <h3 className="text-lg font-bold text-orange-400 mb-2">🏹 Hunter</h3>
                <p className="text-sm">When killed, take one player down with you.</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                <h3 className="text-lg font-bold text-gray-400 mb-2">👤 Villager</h3>
                <p className="text-sm">No special abilities. Use logic and discussion to find werewolves.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              🌙 Game Flow
            </h2>
            <ol className="space-y-2 list-decimal list-inside">
              <li><strong className="text-white">Night Phase:</strong> Werewolves choose a victim. Special roles use their abilities.</li>
              <li><strong className="text-white">Day Phase:</strong> All players discuss and vote to eliminate a suspected werewolf.</li>
              <li><strong className="text-white">Repeat:</strong> Continue until all werewolves are eliminated (Villagers win) or werewolves equal villagers (Werewolves win).</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              🎯 Win Conditions
            </h2>
            <div className="space-y-2">
              <p><strong className="text-green-400">Villagers Win:</strong> Eliminate all werewolves</p>
              <p><strong className="text-red-400">Werewolves Win:</strong> Equal or outnumber the villagers</p>
            </div>
          </section>
        </div>
      </div>

      {/* Call to Action */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-gray-400 text-lg">Ready to join the hunt?</p>
        <StartGameButton onClick={() => router.push("/lobby")}>
          ENTER THE VILLAGE
        </StartGameButton>
      </div>
    </div>
  );
}
