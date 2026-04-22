"use client";

import { ChevronRight, Dices, Flame } from "lucide-react";
import { RoomList } from "@/components/lobby/RoomList";
import { StartGameButton } from "@/components/lobby/StartGameButton";
import { CreateRoomModal } from "@/components/lobby/CreateRoomModal";
import { JoinRoomModal } from "@/components/lobby/JoinRoomModal";
import { Room } from "@/shared/types/lobby";

interface LobbyBrowserProps {
  rooms: Room[];
  playerName: string;
  roomCodeInput: string;
  showCreateModal: boolean;
  showJoinModal: boolean;
  onRoomCodeInputChange: (code: string) => void;
  onJoinRoom: (roomId: string) => void;
  onJoinByCode: () => void;
  onOpenCreateModal: () => void;
  onCloseCreateModal: () => void;
  onCloseJoinModal: () => void;
  onCreateRoom: (name: string) => void;
  onJoinByModalCode: (roomCode: string) => void;
  errorMessage?: string | null;
}

export function LobbyBrowser({
  rooms,
  playerName,
  roomCodeInput,
  showCreateModal,
  showJoinModal,
  onRoomCodeInputChange,
  onJoinRoom,
  onJoinByCode,
  onOpenCreateModal,
  onCloseCreateModal,
  onCloseJoinModal,
  onCreateRoom,
  onJoinByModalCode,
  errorMessage,
}: LobbyBrowserProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between relative z-10 overflow-hidden">
      <div className="flex-1 flex justify-between px-10 pt-10 pb-4 overflow-hidden relative">
        <div className="fixed inset-0 pointer-events-none z-0">
          {rooms.length === 0 ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center animate-[float_4s_ease-in-out_infinite]">
              <Flame className="w-24 h-24 text-gray-700 opacity-50 pointer-events-auto" />
              <p className="mt-6 text-brand-moonlight/60 text-lg font-serif">The square is quiet... Light a new fire?</p>
            </div>
          ) : (
            <div className="w-full h-full pointer-events-auto relative">
              <RoomList rooms={rooms} onJoinRoom={onJoinRoom} />
            </div>
          )}
        </div>

        <div className="flex-1" />

        <div className="w-[340px] bg-black/20 backdrop-blur-[6px] border border-white/10 rounded-2xl p-6 shrink-0 flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-y-auto custom-scrollbar mr-4 mt-8 max-h-full">
          <h2 className="text-xl font-serif text-brand-moonlight mb-6 border-b border-white/10 pb-4 relative z-10">The Tavern</h2>

          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-14 h-14 bg-[#111] rounded-full border-2 border-brand-moonlight shadow-[0_0_10px_rgba(168,192,214,0.3)] flex items-center justify-center">
              👤
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white drop-shadow-md">{playerName}</span>
                <span className="bg-brand-blood px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">LVL 4</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">Games: 42 • Win Rate: 68%</div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-8 relative z-10">
            <button className="bg-brand-moonlight/10 hover:bg-brand-moonlight/20 text-brand-moonlight border border-brand-moonlight/30 rounded-lg py-3 px-4 flex items-center justify-center gap-2 font-bold transition-all shadow-[0_0_15px_rgba(168,192,214,0.05)] hover:shadow-[0_0_20px_rgba(168,192,214,0.15)]">
              <Dices className="w-5 h-5" /> Join Random Fire
            </button>
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

          <div className="flex-1 relative z-10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Awake Friends (2)</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#111] border border-green-500/50 flex items-center justify-center text-xs">🐺</div>
                <div>
                  <div className="text-sm font-bold text-gray-200">ShadowBite</div>
                  <div className="text-[10px] text-green-400">Sitting by campfire #47</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#111] border border-blue-500/50 flex items-center justify-center text-xs">👁️</div>
                <div>
                  <div className="text-sm font-bold text-gray-200">LunaSeer</div>
                  <div className="text-[10px] text-blue-400">In game</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-24 bg-gradient-to-t from-brand-background via-brand-background/80 to-transparent flex items-center justify-center relative shrink-0">
        <StartGameButton onClick={onOpenCreateModal}>LIGHT A NEW FIRE</StartGameButton>
      </div>

      <CreateRoomModal isOpen={showCreateModal} onClose={onCloseCreateModal} onCreate={onCreateRoom} />
      <JoinRoomModal isOpen={showJoinModal} onClose={onCloseJoinModal} onJoin={onJoinByModalCode} />
    </div>
  );
}
