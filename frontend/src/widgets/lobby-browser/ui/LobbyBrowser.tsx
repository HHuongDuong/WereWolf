"use client";

import { ChevronRight, Dices, BookOpen, X } from "lucide-react";
import { useState } from "react";
import { RoomList } from "@/components/lobby/RoomList";
import { StartGameButton } from "@/components/lobby/StartGameButton";
import { JoinRoomModal } from "@/components/lobby/JoinRoomModal";
import { Room } from "@/shared/types/lobby";

interface LobbyBrowserProps {
  rooms: Room[];
  playerName: string;
  roomCodeInput: string;
  showJoinModal: boolean;
  onRoomCodeInputChange: (code: string) => void;
  onJoinRoom: (roomId: string) => void;
  onJoinByCode: () => void;
  onOpenJoinModal: () => void;
  onCloseJoinModal: () => void;
  onCreateRoom: () => void;
  onJoinByModalCode: (roomCode: string) => void;
  errorMessage?: string | null;
}

export function LobbyBrowser({
  rooms,
  playerName,
  roomCodeInput,
  showJoinModal,
  onRoomCodeInputChange,
  onJoinRoom,
  onJoinByCode,
  onOpenJoinModal,
  onCloseJoinModal,
  onCreateRoom,
  onJoinByModalCode,
  errorMessage,
}: LobbyBrowserProps) {
  const [showRules, setShowRules] = useState(false);

  // Werewolf gameplay tips
  const gameplayTips = [
    "As a Villager, pay attention to voting patterns. Werewolves often vote together.",
    "The Seer should stay hidden early game. Revealing too soon makes you a target.",
    "Guards should vary their protection targets. Predictable patterns help werewolves.",
    "Witches should save their poison for confirmed werewolves, not suspicions.",
    "Hunters should wait for maximum information before using their final shot.",
    "Werewolves should spread suspicion and avoid defending each other openly.",
    "During day discussion, ask questions and observe who deflects or stays silent.",
    "Night deaths reveal information. Consider who the werewolves fear most.",
    "Don't reveal your role unless absolutely necessary. Information helps werewolves.",
    "Trust patterns over single claims. Consistent behavior is harder to fake.",
  ];

  const [currentTip] = useState(() => gameplayTips[Math.floor(Math.random() * gameplayTips.length)]);

  return (
    <div className="w-full h-full flex flex-col justify-between relative z-10 overflow-hidden">
      <div className="flex-1 flex justify-between px-10 pt-10 pb-4 overflow-hidden relative">
        <div className="fixed inset-0 pointer-events-none z-0">
          {rooms.length === 0 ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center animate-[float_4s_ease-in-out_infinite]">
              <BookOpen className="w-24 h-24 text-gray-900 opacity-50 pointer-events-auto" />
              <p className="mt-6 text-brand-moonlight/90 text-lg font-serif">The square is quiet...</p>
              <button
                onClick={() => setShowRules(true)}
                className="mt-4 px-6 py-2 bg-brand-moonlight/10 hover:bg-brand-moonlight/20 text-brand-moonlight border border-brand-moonlight/30 rounded-sm font-bold text-sm transition-all pointer-events-auto"
              >
                Read the Rules
              </button>
            </div>
          ) : (
            <div className="w-full h-full pointer-events-auto relative">
              <RoomList rooms={rooms} onJoinRoom={onJoinRoom} />
            </div>
          )}
        </div>

        <div className="flex-1" />

        <div className="w-[380px] bg-black/20 backdrop-blur-[6px] border border-white/10 rounded-lg p-6 shrink-0 flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-y-auto custom-scrollbar mr-4 mt-8 max-h-full">
          <h2 className="text-xl font-serif text-brand-moonlight mb-6 border-b border-white/10 pb-4 relative z-10">The Tavern</h2>

          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-14 h-14 bg-[#111] rounded-full border-2 border-brand-moonlight shadow-[0_0_10px_rgba(168,192,214,0.3)] flex items-center justify-center">
              👤
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white drop-shadow-md">{playerName}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">Wandering Traveler</div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-6 relative z-10">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Room Code (6 chars)"
                value={roomCodeInput}
                onChange={(event) => onRoomCodeInputChange(event.target.value.toUpperCase())}
                maxLength={6}
                onKeyDown={(event) => event.key === "Enter" && onJoinByCode()}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand-moonlight/50 transition-colors uppercase"
              />
              <button
                onClick={onJoinByCode}
                className="bg-black/60 hover:bg-black border border-white/10 hover:border-brand-moonlight/50 rounded-lg px-4 transition-all"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {!!errorMessage && (
              <div className="text-xs text-red-300 border border-red-800/40 bg-red-950/40 rounded-lg px-3 py-2">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Tavern Notice Board with Tips */}
          <div className="flex-1 relative z-10">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Tavern Notice Board</div>
            <div className="space-y-3">
              <div className="bg-black/30 border border-white/5 rounded-lg p-3">
                <div className="text-xs text-[#CD853F] font-bold mb-1">Strategy Tip</div>
                <p className="text-xs text-gray-400 leading-relaxed italic">
                  "{currentTip}"
                </p>
              </div>
              
              <div className="bg-black/30 border border-white/5 rounded-lg p-3">
                <div className="text-xs text-[#CD853F] font-bold mb-1">Role Reminder</div>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• <span className="text-red-400">Werewolves</span> hunt at night</p>
                  <p>• <span className="text-blue-400">Seer</span> reveals one identity</p>
                  <p>• <span className="text-green-400">Guard</span> protects one player</p>
                  <p>• <span className="text-purple-400">Witch</span> has save & poison</p>
                  <p>• <span className="text-orange-400">Hunter</span> shoots when eliminated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-24 bg-gradient-to-t from-brand-background via-brand-background/80 to-transparent flex items-center justify-center relative shrink-0">
        <StartGameButton onClick={onCreateRoom}>LIGHT A NEW FIRE</StartGameButton>
      </div>

      <JoinRoomModal isOpen={showJoinModal} onClose={onCloseJoinModal} onJoin={onJoinByModalCode} />

      {/* Rules Modal Overlay */}
      {showRules && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setShowRules(false)}
        >
          <div className="max-w-3xl w-full relative max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>            
            {/* Parchment-style container */}
            <div className="bg-gradient-to-b from-[#1a1410] to-[#0d0a08] border-2 border-[#3d2817] rounded-lg shadow-[0_0_60px_rgba(0,0,0,0.9)] relative flex flex-col h-full overflow-hidden">
              {/* Texture overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/old-map.png')" }} />
              
              {/* Top decorative border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B4513] to-transparent opacity-50" />
            
              <div className="p-8 relative z-10 flex flex-col h-full max-h-full">
                <div className="shrink-0">
                  <h2 className="text-3xl font-serif text-[#CD853F] mb-2 text-center tracking-wider border-b border-[#3d2817] pb-4">
                    THE ANCIENT RULES
                  </h2>
                  <p className="text-center text-[#8B7355] text-xs mb-6 italic font-serif">
                    — As passed down through generations —
                  </p>
                </div>
                
                <div className="space-y-6 text-[#C9B8A0] text-sm overflow-y-auto custom-scrollbar pr-4 flex-1">
                  <section>
                    <h3 className="text-lg font-serif text-[#CD853F] mb-3 border-l-2 border-[#8B4513] pl-3">
                      The Roles of Fate
                    </h3>
                    <div className="space-y-2 ml-3">
                      <div className="border-l border-[#3d2817] pl-3 py-1">
                        <span className="text-[#DC143C] font-bold font-serif">Werewolf</span>
                        <span className="text-[#8B7355]"> — </span>
                        <span className="text-[#A0937D]">Hunt the innocent under moonlight's veil</span>
                      </div>
                      <div className="border-l border-[#3d2817] pl-3 py-1">
                        <span className="text-[#4682B4] font-bold font-serif">Seer</span>
                        <span className="text-[#8B7355]"> — </span>
                        <span className="text-[#A0937D]">Divine the truth hidden in shadows</span>
                      </div>
                      <div className="border-l border-[#3d2817] pl-3 py-1">
                        <span className="text-[#228B22] font-bold font-serif">Guard</span>
                        <span className="text-[#8B7355]"> — </span>
                        <span className="text-[#A0937D]">Shield one soul from the beast's hunger</span>
                      </div>
                      <div className="border-l border-[#3d2817] pl-3 py-1">
                        <span className="text-[#8B008B] font-bold font-serif">Witch</span>
                        <span className="text-[#8B7355]"> — </span>
                        <span className="text-[#A0937D]">Wield elixir of life or death, but once</span>
                      </div>
                      <div className="border-l border-[#3d2817] pl-3 py-1">
                        <span className="text-[#D2691E] font-bold font-serif">Hunter</span>
                        <span className="text-[#8B7355]"> — </span>
                        <span className="text-[#A0937D]">In death's embrace, claim one final mark</span>
                      </div>
                      <div className="border-l border-[#3d2817] pl-3 py-1">
                        <span className="text-[#696969] font-bold font-serif">Villager</span>
                        <span className="text-[#8B7355]"> — </span>
                        <span className="text-[#A0937D]">Trust in reason, fear the unknown</span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-serif text-[#CD853F] mb-3 border-l-2 border-[#8B4513] pl-3">
                      The Cycle of Moon & Sun
                    </h3>
                    <div className="ml-3 space-y-2 font-serif text-[#A0937D]">
                      <p className="leading-relaxed">
                        <span className="text-[#CD853F] font-bold">I.</span> When darkness falls, the wolves emerge from shadow. 
                        The gifted ones perform their sacred rites.
                      </p>
                      <p className="leading-relaxed">
                        <span className="text-[#CD853F] font-bold">II.</span> At dawn's first light, the village gathers. 
                        Through word and wisdom, they seek the beast among them.
                      </p>
                      <p className="leading-relaxed">
                        <span className="text-[#CD853F] font-bold">III.</span> The cycle repeats until balance is restored.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-serif text-[#CD853F] mb-3 border-l-2 border-[#8B4513] pl-3">
                      Victory Conditions
                    </h3>
                    <div className="ml-3 space-y-2 font-serif text-[#A0937D]">
                      <p>
                        <span className="text-[#228B22] font-bold">The Village Prevails</span> when all beasts are slain
                      </p>
                      <p>
                        <span className="text-[#DC143C] font-bold">The Wolves Triumph</span> when they equal the innocent
                      </p>
                    </div>
                  </section>
                </div>

                <div className="mt-6 pt-6 border-t border-[#3d2817] flex justify-between items-center shrink-0">
                  <p className="text-[#8B7355] text-xs italic font-serif hidden sm:block">
                    May fortune favor the cunning and the brave...
                  </p>
                  <button 
                    onClick={() => setShowRules(false)}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#8B4513]/20 to-[#3d2817]/40 hover:from-[#8B4513]/40 hover:to-[#8B4513]/30 border border-[#8B4513]/50 hover:border-[#CD853F]/50 rounded text-[#CD853F] hover:text-[#F4A460] font-serif transition-all duration-300 tracking-widest shadow-[0_0_15px_rgba(0,0,0,0.3)] cursor-pointer"
                  >
                    RETURN TO TAVERN
                  </button>
                </div>
              </div>

              {/* Bottom decorative border */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B4513] to-transparent opacity-50 pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
