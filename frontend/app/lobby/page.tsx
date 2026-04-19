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
import { Copy, Settings, Play, ArrowLeft, Users, Trash2 } from "lucide-react";

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
    config,
    setToast 
  } = useGameStore();

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState<Record<string, number | string>>({
    maxPlayers: maxPlayers || 8,
    guardDuration: config?.guardDuration || 30,
    seerDuration: config?.seerDuration || 30,
    werewolfDuration: config?.werewolfDuration || 45,
    witchDuration: config?.witchDuration || 30,
    discussDuration: config?.discussDuration || 60,
    voteDuration: config?.voteDuration || 30,
  });

  // Reset values when opening modal
  useEffect(() => {
    if (isConfigOpen) {
      setLocalConfig({
        maxPlayers: maxPlayers || 8,
        guardDuration: config?.guardDuration || 30,
        seerDuration: config?.seerDuration || 30,
        werewolfDuration: config?.werewolfDuration || 45,
        witchDuration: config?.witchDuration || 30,
        discussDuration: config?.discussDuration || 60,
        voteDuration: config?.voteDuration || 30,
      });
    }
  }, [isConfigOpen, maxPlayers, config]);

  const updateLocalConfig = (field: string, value: string) => {
    const parsed = value === "" ? "" : parseInt(value, 10);
    setLocalConfig(prev => ({ ...prev, [field]: isNaN(parsed as number) ? "" : parsed }));
  };

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

  const copyShareLink = () => {
    if (roomCode) {
      const shareLink = `${window.location.origin}/?join=${roomCode}`;
      navigator.clipboard.writeText(shareLink);
      setToast("Đã copy link mời!", "success");
    }
  };

  const handleLeaveRoom = () => {
    // Emit leave event first
    socketManger.emit("LEAVE_ROOM", { roomId, guestId: myGuestId });
    // Reset state immediately
    useGameStore.getState().reset();
    // Force redirect (backup in case useEffect doesn't trigger fast enough)
    setTimeout(() => router.replace("/"), 0);
  };

  const handleSaveConfig = () => {
    const { maxPlayers: parsedMax, ...phaseConfig } = localConfig;
    const maxPlayersNum = Number(parsedMax);
    if (isNaN(maxPlayersNum) || maxPlayersNum < 6 || maxPlayersNum > 12) {
      setToast("Số lượng người chơi phải từ 6 đến 12", "error");
      return;
    }
    
    // Cast and validate rules matching backend DTO
    const guardDur = Number(phaseConfig.guardDuration);
    const seerDur = Number(phaseConfig.seerDuration);
    const witchDur = Number(phaseConfig.witchDuration);
    const voteDur = Number(phaseConfig.voteDuration);
    const werewolfDur = Number(phaseConfig.werewolfDuration);
    const discussDur = Number(phaseConfig.discussDuration);

    if (guardDur < 20 || guardDur > 60 ||
        seerDur < 20 || seerDur > 60 ||
        witchDur < 20 || witchDur > 60 ||
        voteDur < 20 || voteDur > 60) {
      setToast("Thời gian các role (Bảo vệ, Tiên tri, Phù thuỷ) và Vote phải từ 20s-60s", "error");
      return;
    }
    if (werewolfDur < 30 || werewolfDur > 60) {
      setToast("Thời gian của Sói phải từ 30s-60s", "error");
      return;
    }
    if (discussDur < 30 || discussDur > 180) {
      setToast("Thời gian Thảo luận ngày phải từ 30s-180s", "error");
      return;
    }

    socketManger.emit("CONFIGURE_ROOM", {
      guestId: myGuestId,
      maxPlayers: maxPlayersNum,
      config: {
        guardDuration: guardDur,
        seerDuration: seerDur,
        werewolfDuration: werewolfDur,
        witchDuration: witchDur,
        discussDuration: discussDur,
        voteDuration: voteDur
      }
    });
    setIsConfigOpen(false);
  };

  const handleCancelRoom = () => {
    socketManger.emit("CANCEL_ROOM", { guestId: myGuestId });
    setIsCancelConfirmOpen(false);
    // Khi emit xong, backend xử lý và tát cả members dều sẽ nhận được sự kiện ROOM_CANCELLED.
    // Sự kiện này đã được xử lý trong useGameSocket.ts -> gọi reset() -> đá văng về Home.
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
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={handleLeaveRoom} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Rời phòng
          </Button>
          {isHost && (
            <Button 
              variant="ghost" 
              onClick={() => setIsCancelConfirmOpen(true)} 
              size="sm"
              className="text-wolf-red hover:text-red-400 hover:bg-wolf-red/10 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hủy phòng
            </Button>
          )}
        </div>
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
        <div className="text-center mb-6 animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
          <div>
            <p className="text-text-secondary uppercase tracking-widest text-xs mb-2 font-semibold">
              Mã Phòng
            </p>
            <div 
              onClick={copyRoomCode}
              className="group flex items-center justify-center space-x-3 bg-bg-surface/50 border border-bg-elevated rounded-sm px-6 py-3 cursor-pointer hover:bg-bg-elevated/50 hover:border-wolf-red/50 transition-all shadow-lg"
            >
              <h2 className="font-mono text-4xl md:text-5xl font-bold tracking-widest text-text-primary group-hover:text-village-gold transition-colors drop-shadow-md">
                {roomCode}
              </h2>
              <Copy className="h-5 w-5 text-text-muted group-hover:text-village-gold transition-colors" />
            </div>
          </div>

          {/* Share Link Section */}
          <div className="max-w-2xl mx-auto">
            <p className="text-text-secondary uppercase tracking-widest text-[10px] mb-1.5 font-semibold">
              Hoặc chia sẻ link
            </p>
            <div 
              onClick={copyShareLink}
              className="group flex items-center gap-2 bg-bg-surface/50 border border-bg-elevated rounded-sm px-3 py-2 shadow-lg cursor-pointer hover:bg-bg-elevated/50 hover:border-village-gold/50 transition-all"
            >
              <div className="flex-1 overflow-hidden">
                <p className="text-text-muted group-hover:text-village-gold text-xs font-mono truncate transition-colors">
                  {typeof window !== 'undefined' ? `${window.location.origin}/?join=${roomCode}` : ''}
                </p>
              </div>
              <Copy className="h-3 w-3 text-text-muted group-hover:text-village-gold transition-colors shrink-0" />
            </div>
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
        <div className="mt-6 mb-8 w-full max-w-sm flex justify-center animate-in fade-in duration-700 delay-300">
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
        title="Cấu Hình Tham Số Trò Chơi"
        description="Tinh chỉnh chi tiết cấu hình và thời gian của các giai đoạn"
      >
        <div className="space-y-4 mt-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Section 1: Cấu hình chung */}
          <div className="pb-2 border-b border-bg-elevated/50">
            <h3 className="text-village-gold font-body font-bold uppercase tracking-wider text-sm mb-3">Thông số chung</h3>
            <div className="grid grid-cols-2 gap-4 items-center">
              <label className="text-sm font-medium text-text-secondary">Số Người Chơi (6-12)</label>
              <Input 
                type="number" 
                min={6} 
                max={12} 
                value={localConfig.maxPlayers} 
                onChange={(e) => updateLocalConfig("maxPlayers", e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* Section 2: Thời gian màn đêm */}
          <div className="pb-2 border-b border-bg-elevated/50">
            <h3 className="text-wolf-red font-body font-bold uppercase tracking-wider text-sm mb-3">Thời Gian Đêm (Giây)</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-text-secondary">Sói Cắn (30-60)</label>
                <Input type="number" min={30} max={60} className="h-9"
                  value={localConfig.werewolfDuration} 
                  onChange={(e) => updateLocalConfig("werewolfDuration", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-text-secondary">Bảo Vệ (20-60)</label>
                <Input type="number" min={20} max={60} className="h-9"
                  value={localConfig.guardDuration} 
                  onChange={(e) => updateLocalConfig("guardDuration", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-text-secondary">Tiên Tri (20-60)</label>
                <Input type="number" min={20} max={60} className="h-9"
                  value={localConfig.seerDuration} 
                  onChange={(e) => updateLocalConfig("seerDuration", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-text-secondary">Phù Thủy (20-60)</label>
                <Input type="number" min={20} max={60} className="h-9"
                  value={localConfig.witchDuration} 
                  onChange={(e) => updateLocalConfig("witchDuration", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section 3: Thời gian ban ngày */}
          <div>
            <h3 className="text-village-gold font-body font-bold uppercase tracking-wider text-sm mb-3">Thời Gian Ngày (Giây)</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-text-secondary">Thảo Luận (30-180)</label>
                <Input type="number" min={30} max={180} className="h-9"
                  value={localConfig.discussDuration} 
                  onChange={(e) => updateLocalConfig("discussDuration", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-text-secondary">Bỏ Phiếu (20-60)</label>
                <Input type="number" min={20} max={60} className="h-9"
                  value={localConfig.voteDuration} 
                  onChange={(e) => updateLocalConfig("voteDuration", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-bg-elevated/50 mt-4">
            <Button variant="ghost" onClick={() => setIsConfigOpen(false)}>Hủy</Button>
            <Button variant="gold" onClick={handleSaveConfig}>Lưu Cấu Hình</Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal 
        isOpen={isCancelConfirmOpen} 
        onClose={() => setIsCancelConfirmOpen(false)}
        title="Xác Nhận Hủy Phòng"
        description="Bạn có chắc chắn muốn đánh sập phòng này không? Toàn bộ người chơi sẽ bị Kick ra ngoài màn hình chờ."
      >
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="ghost" onClick={() => setIsCancelConfirmOpen(false)}>Quay Lại</Button>
          <Button variant="danger" onClick={handleCancelRoom}>Đồng Ý Hủy</Button>
        </div>
      </Modal>
    </div>
  );
}
