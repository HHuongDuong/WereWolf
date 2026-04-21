"use client";

import { Room } from "@/shared/types/lobby";
import { PlayerSlot } from "./PlayerSlot";
import { EmptySlot } from "./EmptySlot";
import { StartGameButton } from "./StartGameButton";

interface RoomInfoPanelProps {
  room: Room;
  currentUserId: string;
  onReadyChange: (ready: boolean) => void;
  onKickPlayer: (playerId: string) => void;
  onLeaveRoom: () => void;
  onStartGame: () => void;
}

export function RoomInfoPanel({
  room,
  currentUserId,
  onReadyChange,
  onKickPlayer,
  onLeaveRoom,
  onStartGame,
}: RoomInfoPanelProps) {
  const isHost = room.hostId === currentUserId;
  const currentUser = room.players.find(p => p.id === currentUserId);
  const isReady = currentUser?.isReady || false;
  const allReady = room.players.every((p) => p.isReady) && room.players.length >= 6;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 p-6 font-sans">
      
      {/* HEADER: Double Lined Border Style */}
      <div className="border-[3px] border-double border-[#3A2A1A] bg-[#110C08]/90 backdrop-blur-md p-5 rounded-lg shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-matter.png")' }} />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center border-b border-[#3A2A1A] pb-3 mb-3 gap-4">
           <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-200 tracking-wider uppercase drop-shadow-lg">
             {room.name} <span className="text-[#FF4500]/80">#{room.code.split('-')[1] || room.code}</span>
           </h1>
           <div className="flex items-center gap-3 text-brand-moonlight font-bold text-lg">
             {room.currentPlayers}/{room.maxPlayers} VILLAGERS GATHERED 🌕
           </div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center text-sm font-bold tracking-widest text-[#A8C0D6]">
           <span>HOST: <span className="text-white">{room.hostName}</span></span>
           <span>PHASE: <span className="text-white">WAITING FOR RITUAL</span></span>
        </div>
      </div>

      {/* CENTRAL AREA: THE VILLAGE SQUARE */}
      <div className="border border-[#2A1A1A] bg-gradient-to-b from-[#160B0B] to-[#0A0505] rounded-xl p-10 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-scales.png")' }} />
         
         <h2 className="text-[#FF4500]/60 tracking-[0.4em] text-sm font-bold mb-8 z-10">THE VILLAGE SQUARE</h2>
         
         <div className="text-3xl md:text-4xl font-serif text-brand-moonlight mb-6 drop-shadow-[0_0_15px_rgba(168,192,214,0.3)] z-10">
            🌕 THE BLOOD MOON RISES SOON...
         </div>
         
         <p className="text-gray-400 mb-10 z-10 tracking-widest">
            PLAYERS GATHERED: <span className="font-bold text-white text-lg ml-2">{room.currentPlayers} / {room.maxPlayers}</span>
         </p>
         
         <div className="z-10 w-full max-w-md">
            {isHost ? (
               <StartGameButton onClick={onStartGame} disabled={!allReady} className="w-full shadow-[0_0_40px_rgba(159,18,57,0.5)]">
                  IGNITE THE GATHERING
               </StartGameButton>
            ) : (
               <div className="py-4 px-6 border border-gray-800 bg-gray-900/50 rounded-lg text-gray-400 italic text-sm">
                  Waiting for the village elder to begin the ritual...
               </div>
            )}
         </div>
      </div>

      {/* PLAYER SLOTS: Horizontal / Vertical Grid */}
      <div className="flex flex-wrap justify-center gap-6 mt-4">
         {room.players.map((player) => (
           <PlayerSlot
             key={player.id}
             player={player}
             isHost={room.hostId === player.id}
             isCurrentUser={player.id === currentUserId}
             canKick={isHost && player.id !== currentUserId}
             onKick={onKickPlayer}
           />
         ))}
         {Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
           <EmptySlot key={i} />
         ))}
      </div>

      {/* BOTTOM PANEL: Actions & Chat */}
      <div className="mt-8 pt-8 border-t border-[#2A1A1A] grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Action Buttons */}
         <div className="col-span-1 flex flex-col gap-4">
            <button 
              onClick={() => onReadyChange(!isReady)}
              className={`py-4 px-6 border rounded-lg font-bold tracking-widest text-xs transition-all shadow-lg
                ${isReady 
                  ? "bg-[#1A1A24] border-gray-600 text-gray-300 hover:bg-gray-800" 
                  : "bg-[#FF4500]/10 border-[#FF4500]/50 text-[#FF8A00] hover:bg-[#FF4500]/20 hover:shadow-[0_0_15px_rgba(255,69,0,0.2)]"
                }`}
            >
               {isReady ? "STEP AWAY FROM THE SQUARE" : "GATHER AROUND THE FIRE"}
            </button>
            <button className="py-4 px-6 border border-[#3A2A1A] bg-[#160B0B] text-gray-400 rounded-lg font-bold tracking-widest text-xs hover:bg-[#2A1A1A] transition-all">
               READ THE OLD TALES
            </button>
            <button 
              onClick={onLeaveRoom}
              className="py-4 px-6 border border-red-900/30 bg-[#0A0505] text-red-700 rounded-lg font-bold tracking-widest text-xs hover:bg-red-950/50 hover:text-red-500 transition-all mt-auto"
            >
               LEAVE THE VILLAGE
            </button>
         </div>

         {/* Chat Log (Parchment Style Box) */}
         <div className="col-span-1 lg:col-span-2 bg-[#1A1612] border-2 border-[#3A2A1A] rounded-lg p-5 shadow-inner relative overflow-hidden">
            {/* Very faint parchment overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/parchment.png")' }} />
            
            <div className="relative z-10 flex flex-col h-56">
               <div className="flex-1 overflow-y-auto space-y-3 text-sm font-serif pr-2 custom-scrollbar">
                  <div className="text-gray-500 italic border-b border-gray-800/50 pb-2">
                     System: The blood moon rises over the square...
                  </div>
                  <div className="text-gray-300"><span className="text-[#A8C0D6] font-bold">Vesper:</span> Ready to hunt or be hunted.</div>
                  <div className="text-gray-300"><span className="text-[#A8C0D6] font-bold">Thorne:</span> We need two more souls before we begin.</div>
               </div>
               
               <div className="mt-4 pt-3 border-t border-[#3A2A1A] flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Whisper into the dark..." 
                    className="flex-1 bg-[#0A0806] border border-[#2A1A1A] rounded px-4 py-2 text-gray-300 placeholder-gray-600 text-sm italic focus:outline-none focus:border-[#FF4500]/50 transition-colors"
                  />
                  <button className="px-4 py-2 bg-[#2A1A1A] hover:bg-[#3A2A1A] text-gray-400 rounded text-xs font-bold tracking-widest transition-colors border border-[#3A2A1A]">
                     SEND
                  </button>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
