"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { socketManger } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlayerCard } from "@/components/ui/player-card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Copy, Settings, Play, ArrowLeft, Users } from "lucide-react";

export default function LobbyPage() {
  const router = useRouter();
  const { 
    roomStatus, 
    roomId, 
    roomCode, 
    myGuestId, 
    hostId, 
    players, 
    maxPlayers, 
    setToast 
  } = useGameStore();

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configMaxPlayers, setConfigMaxPlayers] = useState(maxPlayers);

  // Redirection guards
  useEffect(() => {
    if (roomStatus === "idle" || !roomId) {
      router.replace("/");
    } else if (roomStatus === "in_game") {
      router.replace("/game");
    }
  }, [roomStatus, roomId, router]);

  if (roomStatus !== "waiting") return null;

  const isHost = myGuestId === hostId;
  const missingPlayersCount = Math.max(0, maxPlayers - players.length);
  const canStart = isHost && players.length >= 6; // Assume minimum 6 to start

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setToast("Đã copy mã phòng!", "info");
    }
  };

  const handleLeaveRoom = () => {
    socketManger.emit("LEAVE_ROOM", { roomId, guestId: myGuestId });
    router.replace("/");
  };

  const handleSaveConfig = () => {
    const parsed = parseInt(configMaxPlayers.toString(), 10);
    if (isNaN(parsed) || parsed < 6 || parsed > 12) {
      setToast("Số lượng người chơi phải từ 6 đến 12", "error");
      return;
    }
    
    socketManger.emit("CONFIGURE_ROOM", {
      guestId: myGuestId,
      maxPlayers: parsed,
      config: {} // Can be expanded with duration configs if needed
    });
    setIsConfigOpen(false);
  };

  const handleStartGame = () => {
    socketManger.emit("START_GAME", { guestId: myGuestId });
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 bg-bg-base relative min-h-screen">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none" 
        style={{ backgroundImage: "url('/lobby_background.jpeg')" }}
      />
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(26,26,62,0.4)_0%,rgba(13,13,20,0.95)_100%)] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={handleLeaveRoom} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Rời phòng
        </Button>
        <div className="flex items-center space-x-2">
          {isHost && (
            <Button variant="ghost" size="sm" onClick={() => setIsConfigOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Cấu hình
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Room Code Section */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <p className="text-text-secondary uppercase tracking-widest text-sm mb-2 font-semibold">
            Mã Phòng
          </p>
          <div 
            onClick={copyRoomCode}
            className="group flex items-center justify-center space-x-4 bg-bg-surface/50 border border-bg-elevated rounded-sm px-8 py-4 cursor-pointer hover:bg-bg-elevated/50 hover:border-wolf-red/50 transition-all shadow-lg"
          >
            <h2 className="font-mono text-5xl md:text-6xl font-bold tracking-widest text-text-primary group-hover:text-village-gold transition-colors drop-shadow-md">
              {roomCode}
            </h2>
            <Copy className="h-6 w-6 text-text-muted group-hover:text-village-gold transition-colors" />
          </div>
        </div>

        {/* Player Grid Section */}
        <Card className="w-full bg-bg-surface/40 backdrop-blur-md border-bg-elevated">
          <CardHeader className="flex flex-row items-center justify-between border-b border-bg-elevated/50 pb-4">
            <div>
              <CardTitle className="text-xl">Người Chơi</CardTitle>
              <CardDescription>
                Đang chờ đủ người... ({players.length}/{maxPlayers})
              </CardDescription>
            </div>
            <div className="flex items-center justify-center p-3 rounded-sm bg-bg-elevated/50 ring-1 ring-bg-elevated">
              <Users className="h-5 w-5 text-text-secondary mr-2" />
              <span className="font-mono font-bold text-village-gold">{players.length}/{maxPlayers}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {players.map((p) => (
                <PlayerCard 
                  key={p.guestId} 
                  displayName={p.displayName} 
                  isHost={p.guestId === hostId} 
                />
              ))}
              
              {/* Render ghost slots */}
              {Array.from({ length: missingPlayersCount }).map((_, i) => (
                 <PlayerCard key={`empty-${i}`} isEmpty />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="mt-8 mb-12 w-full max-w-sm flex justify-center animate-in fade-in duration-700 delay-300">
          {isHost ? (
            <div className="w-full relative">
              {/* Glow effect behind button */}
              {canStart && (
                <div className="absolute inset-0 bg-wolf-red-glow opacity-50 blur-xl rounded-full" />
              )}
              <Button 
                variant={canStart ? "danger" : "default"} 
                size="lg" 
                className="w-full relative z-10"
                onClick={handleStartGame}
                disabled={!canStart}
              >
                <Play className="h-5 w-5 mr-2 fill-current" />
                {canStart ? "Bắt Đầu Trò Chơi" : "Chờ Đủ Người"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-text-secondary bg-bg-surface/50 px-6 py-3 rounded-sm border border-bg-elevated">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-village-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-village-gold"></span>
              </span>
              <span className="font-medium text-sm">Đang chờ chủ phòng bắt đầu...</span>
            </div>
          )}
        </div>
      </main>

      {/* Configuration Modal */}
      <Modal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)}
        title="Cấu Hình Phòng"
        description="Đổi số lượng người chơi tối đa (từ 6 đến 12)"
      >
        <div className="space-y-6 mt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Số Người Tối Đa</label>
            <Input 
              type="number" 
              min={6} 
              max={12} 
              value={configMaxPlayers} 
              onChange={(e) => setConfigMaxPlayers(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setIsConfigOpen(false)}>Hủy</Button>
            <Button variant="gold" onClick={handleSaveConfig}>Lưu Cấu Hình</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
