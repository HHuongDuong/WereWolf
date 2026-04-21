"use client";
import { useState } from "react";
import { Flame, ChevronRight, Dices } from "lucide-react";
import { RoomList } from "@/components/lobby/RoomList";
import { CreateRoomModal } from "@/components/lobby/CreateRoomModal";
import { JoinRoomModal } from "@/components/lobby/JoinRoomModal";
import { StartGameButton } from "@/components/lobby/StartGameButton";
import { RoomInfoPanel } from "@/components/lobby/RoomInfoPanel";
import { Room } from "@/shared/types/lobby";
import { useLobbyStore } from "@/shared/store/useLobbyStore";

export default function LobbyView() {
  const rooms = useLobbyStore((state) => state.rooms);
  const addRoom = useLobbyStore((state) => state.addRoom);
  const playerName = useLobbyStore((state) => state.playerName);
  const setPlayerName = useLobbyStore((state) => state.setPlayerName);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");

  const currentUserId = "user-123";

  const handleCreateRoom = (name: string) => {
    const newRoom: Room = {
      id: Math.random().toString(36).substring(7),
      name: name || "Gathering",
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      hostName: playerName || "Villager",
      hostId: currentUserId,
      currentPlayers: 1,
      maxPlayers: 12,
      players: [
        {
          id: currentUserId,
          name: playerName || "Villager",
          isReady: false,
          role: null,
          isAlive: true,
        }
      ],
    };
    addRoom(newRoom);
    setCurrentRoomId(newRoom.id);
    setShowCreateModal(false);
  };

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
  };

  const handleJoinByCode = () => {
    const code = roomCodeInput.trim().toUpperCase();
    if (!code) return;
    
    const foundRoom = rooms.find(r => r.code === code);
    if (foundRoom) {
      setCurrentRoomId(foundRoom.id);
      setRoomCodeInput(""); // Reset on success
    } else {
      alert("Room not found! The fire might have burned out.");
    }
  };

  if (!playerName) {
    return (
      <div className="w-full h-full flex items-center justify-center relative z-10 p-4">
        {/* Intense background vignette specifically for the modal to draw focus */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none" />
        
        {/* Floating, glowing modal container */}
        <div className="relative z-10 bg-gradient-to-b from-[#1A1210] to-[#0A0505] p-[2px] rounded-2xl shadow-[0_0_80px_rgba(255,69,0,0.15)] animate-[float_6s_ease-in-out_infinite]">
          {/* Inner border wrapper */}
          <div className="bg-[#110C08]/95 p-10 rounded-2xl flex flex-col items-center text-center max-w-md w-full relative overflow-hidden h-full border border-[#FF4500]/20">
            {/* Texture overlay */}
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-matter.png")' }} />
            
            {/* Decorative Top Icon */}
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-[#FF4500] blur-xl opacity-20 rounded-full" />
              <Flame className="w-12 h-12 text-[#FF4500] relative z-10 animate-[flicker_3s_infinite]" />
            </div>

            <h2 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-brand-moonlight to-gray-400 mb-3 relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Welcome, Wanderer
            </h2>
            
            <div className="flex items-center gap-3 w-full justify-center mb-8 relative z-10">
              <div className="h-px bg-gradient-to-r from-transparent via-[#FF4500]/50 to-transparent flex-1" />
              <p className="text-[#FF8A00] text-[10px] font-bold tracking-[0.3em] uppercase">Identity Required</p>
              <div className="h-px bg-gradient-to-l from-transparent via-[#FF4500]/50 to-transparent flex-1" />
            </div>
            
            <p className="text-gray-400 text-sm mb-6 relative z-10 font-serif italic">
              "What name shall the village carve upon your grave if you fall?"
            </p>

            <div className="w-full relative z-10 group mb-8">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF4500]/0 via-[#FF4500]/30 to-[#FF4500]/0 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <input 
                type="text" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="relative w-full bg-[#050303] border border-[#3A2A1A] rounded-lg px-6 py-4 text-center text-2xl text-brand-moonlight focus:outline-none focus:border-[#FF4500]/80 focus:shadow-[0_0_15px_rgba(255,69,0,0.3)] transition-all font-serif placeholder:text-gray-700 placeholder:italic"
                placeholder="Your name..."
                maxLength={16}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && nameInput.trim()) {
                    setPlayerName(nameInput.trim());
                  }
                }}
              />
            </div>

            <StartGameButton 
              onClick={() => {
                if (nameInput.trim()) setPlayerName(nameInput.trim());
              }}
              disabled={!nameInput.trim()}
              className="w-full relative z-10 shadow-[0_0_30px_rgba(159,18,57,0.3)]"
            >
              ENTER THE VILLAGE
            </StartGameButton>
          </div>
        </div>
      </div>
    );
  }

  if (currentRoomId) {
    const room = rooms.find(r => r.id === currentRoomId);
    if (!room) return null; // Or handle error

    return (
      <div className="w-full h-full overflow-y-auto relative z-10 custom-scrollbar">
        <div className="min-h-full w-full flex flex-col items-center justify-start py-10">
          <RoomInfoPanel
            room={room}
            currentUserId={currentUserId}
            onReadyChange={(ready) => console.log("Ready changed:", ready)}
            onKickPlayer={(id) => console.log("Kicking player:", id)}
            onLeaveRoom={() => setCurrentRoomId(null)}
            onStartGame={() => console.log("Starting game...")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-between relative z-10 overflow-hidden">
      
      {/* Top Main Area: Village Square + Tavern Panel */}
      <div className="flex-1 flex justify-between px-10 pt-10 pb-4 overflow-hidden relative">
        {/* Full Canvas for RoomList (Fixed to viewport to perfectly match click-map coordinates) */}
        <div className="fixed inset-0 pointer-events-none z-0">
             {rooms.length === 0 ? (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center animate-[float_4s_ease-in-out_infinite]">
                  <Flame className="w-24 h-24 text-gray-700 opacity-50 pointer-events-auto" />
                  <p className="mt-6 text-brand-moonlight/60 text-lg font-serif">The square is quiet... Light a new fire?</p>
               </div>
             ) : (
               <div className="w-full h-full pointer-events-auto relative">
                 <RoomList rooms={rooms} onJoinRoom={handleJoinRoom} />
               </div>
             )}
        </div>

  {/* Invisible spacer to push Tavern to the right since RoomList is now absolute */ }
  <div className="flex-1" />

  {/* Right Panel: The Tavern (Glass pane overlaid on background tavern) */ }
  <div className="w-[340px] bg-black/20 backdrop-blur-[6px] border border-white/10 rounded-2xl p-6 shrink-0 flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-y-auto custom-scrollbar mr-4 mt-8 max-h-full">

    <h2 className="text-xl font-serif text-brand-moonlight mb-6 border-b border-white/10 pb-4 relative z-10">The Tavern</h2>

    {/* Player Profile Snippet */}
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

    {/* Quick Actions */}
    <div className="flex flex-col gap-3 mb-8 relative z-10">
      <button className="bg-brand-moonlight/10 hover:bg-brand-moonlight/20 text-brand-moonlight border border-brand-moonlight/30 rounded-lg py-3 px-4 flex items-center justify-center gap-2 font-bold transition-all shadow-[0_0_15px_rgba(168,192,214,0.05)] hover:shadow-[0_0_20px_rgba(168,192,214,0.15)]">
        <Dices className="w-5 h-5" /> Join Random Fire
      </button>
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Room Code (6 chars)" 
          value={roomCodeInput}
          onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
          maxLength={6}
          onKeyDown={(e) => e.key === "Enter" && handleJoinByCode()}
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand-moonlight/50 transition-colors uppercase" 
        />
        <button 
          onClick={handleJoinByCode}
          className="bg-black/60 hover:bg-black border border-white/10 hover:border-brand-moonlight/50 rounded-lg px-4 transition-all"
        >
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>

    {/* Awake Friends */}
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
      </div >

    {/* Bottom Action Dock */ }
    < div className = "h-24 bg-gradient-to-t from-brand-background via-brand-background/80 to-transparent flex items-center justify-center relative shrink-0" >
      <StartGameButton onClick={() => setShowCreateModal(true)}>
        LIGHT A NEW FIRE
      </StartGameButton>
      </div >

      <CreateRoomModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateRoom} />
      <JoinRoomModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} onJoin={handleJoinRoom} />
    </div >
  );
}