"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/button";
import { socketManger } from "@/lib/socket";
import { Shield, Eye, Skull, Droplet, Moon } from "lucide-react";

export function NightPanel() {
  const { myRole, players, deadPlayers, roomId, myGuestId, werewolfKillTargetId } = useGameStore();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [witchAction, setWitchAction] = useState<"save" | "poison" | "skip">("skip");

  // Filter alive players
  const alivePlayers = players.filter(p => !deadPlayers.includes(p.guestId));

  const handleSubmitAction = (actionType: string, targetId: string | null) => {
    socketManger.emit("night_action", {
      roomId,
      actionType,
      targetId
    });
    setHasSubmitted(true);
  };

  if (hasSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-black/40 backdrop-blur-sm border border-white/5 rounded-sm">
        <Moon className="w-12 h-12 text-night-purple/50 animate-pulse mb-4" />
        <h3 className="text-xl font-display text-white tracking-widest mb-2">ĐÃ HOÀN TẤT</h3>
        <p className="text-sm text-text-secondary">Vui lòng nhắm mắt chờ những người khác thức dậy...</p>
      </div>
    );
  }

  const role = myRole?.toLowerCase();

  // Render specific panel based on role
  if (role === "werewolf") {
    // Werewolf cannot kill wolves ideally, but frontend just shows all non-self currently unless we know who other wolves are
    // Wait, in werewolf vision, we might need a specific indicator for other wolves. 
    return (
      <div className="flex flex-col space-y-6 bg-black/40 backdrop-blur-sm p-6 rounded-sm border border-wolf-red/20 shadow-[0_0_30px_rgba(192,57,43,0.1)]">
        <div className="text-center mb-4">
          <Skull className="w-10 h-10 text-wolf-red mx-auto mb-2" />
          <h3 className="text-lg font-display text-wolf-red tracking-widest uppercase">Mục tiêu đêm nay</h3>
          <p className="text-xs text-text-muted mt-1">Chọn một con mồi để kết liễu.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
          {alivePlayers.filter(p => p.guestId !== myGuestId).map(p => (
            <button
              key={p.guestId}
              onClick={() => setSelectedTarget(p.guestId)}
              className={`p-3 border rounded-sm transition-all text-left ${selectedTarget === p.guestId ? 'border-wolf-red bg-wolf-red/20 text-white' : 'border-white/10 hover:border-wolf-red/50 hover:bg-white/5 text-text-secondary'}`}
            >
              <span className="text-sm font-bold truncate block">{p.displayName}</span>
            </button>
          ))}
        </div>

        <Button 
          variant="danger" 
          disabled={!selectedTarget}
          onClick={() => handleSubmitAction("werewolf_kill", selectedTarget)}
          className="w-full mt-4"
        >
          Xác nhận Huyết Tế
        </Button>
      </div>
    );
  }

  if (role === "guard") {
    return (
      <div className="flex flex-col space-y-6 bg-black/40 backdrop-blur-sm p-6 rounded-sm border border-emerald-500/20 shadow-[0_0_30px_rgba(46,204,113,0.1)]">
        <div className="text-center mb-4">
          <Shield className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-lg font-display text-emerald-500 tracking-widest uppercase">Mục tiêu bảo vệ</h3>
          <p className="text-xs text-text-muted mt-1">Chọn một người để dùng khiên che chở (có thể tự chọn mình).</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
          {alivePlayers.map(p => (
            <button
              key={p.guestId}
              onClick={() => setSelectedTarget(p.guestId)}
              className={`p-3 border rounded-sm transition-all text-left ${selectedTarget === p.guestId ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-white/10 hover:border-emerald-500/50 hover:bg-white/5 text-text-secondary'}`}
            >
              <span className="text-sm font-bold truncate block">{p.displayName}</span>
            </button>
          ))}
        </div>

        <Button 
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white"
          disabled={!selectedTarget}
          onClick={() => handleSubmitAction("guard", selectedTarget)}
        >
          Xác nhận Bảo Vệ
        </Button>
      </div>
    );
  }

  if (role === "seer") {
    return (
      <div className="flex flex-col space-y-6 bg-black/40 backdrop-blur-sm p-6 rounded-sm border border-blue-400/20 shadow-[0_0_30px_rgba(52,152,219,0.1)]">
        <div className="text-center mb-4">
          <Eye className="w-10 h-10 text-blue-400 mx-auto mb-2" />
          <h3 className="text-lg font-display text-blue-400 tracking-widest uppercase">Mục tiêu tiên tri</h3>
          <p className="text-xs text-text-muted mt-1">Chọn một người để soi rõ thân phận của họ.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
          {alivePlayers.filter(p => p.guestId !== myGuestId).map(p => (
            <button
              key={p.guestId}
              onClick={() => setSelectedTarget(p.guestId)}
              className={`p-3 border rounded-sm transition-all text-left ${selectedTarget === p.guestId ? 'border-blue-400 bg-blue-400/20 text-white' : 'border-white/10 hover:border-blue-400/50 hover:bg-white/5 text-text-secondary'}`}
            >
              <span className="text-sm font-bold truncate block">{p.displayName}</span>
            </button>
          ))}
        </div>

        <Button 
          className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white"
          disabled={!selectedTarget}
          onClick={() => handleSubmitAction("seer", selectedTarget)}
        >
          Tiến hành Tiên Tri
        </Button>
      </div>
    );
  }

  if (role === "witch") {
    const isTargeting = witchAction === "poison";
    const killedPlayer = werewolfKillTargetId ? players.find(p => p.guestId === werewolfKillTargetId) : null;

    return (
      <div className="flex flex-col space-y-6 bg-black/40 backdrop-blur-sm p-6 rounded-sm border border-purple-500/20 shadow-[0_0_30px_rgba(155,89,182,0.1)]">
        <div className="text-center mb-4">
          <Droplet className="w-10 h-10 text-purple-500 mx-auto mb-2" />
          <h3 className="text-lg font-display text-purple-500 tracking-widest uppercase">Quyền Năng Phù Thủy</h3>
          <p className="text-xs text-text-muted mt-1">Đưa ra quyết định Sinh Tử đêm nay.</p>
        </div>
        
        <div className="bg-bg-elevated/50 p-4 rounded-sm border border-white/5 mb-2">
          <p className="text-sm text-text-secondary mb-3">Đêm nay sói đã cắn:</p>
          {killedPlayer ? (
            <div className="flex items-center justify-between p-3 border border-wolf-red/30 bg-wolf-red/10 rounded-sm">
              <span className="font-bold text-wolf-red">{killedPlayer.displayName}</span>
              <button 
                onClick={() => setWitchAction(witchAction === "save" ? "skip" : "save")}
                className={`text-xs px-3 py-1 rounded-sm border transition-colors ${witchAction === "save" ? 'bg-emerald-500 text-white border-emerald-500' : 'border-white/20 text-text-muted hover:text-white'}`}
              >
                CỨU MẠNG
              </button>
            </div>
          ) : (
            <div className="text-sm font-italic text-text-muted text-center italic py-2">
              (Không thấy ai bị cắn hoặc chưa rõ)
            </div>
          )}
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">Dùng bình TUYỆT MỆNH ĐỘC?</span>
            <button 
              onClick={() => setWitchAction(witchAction === "poison" ? "skip" : "poison")}
              className={`text-xs px-3 py-1 rounded-sm border transition-colors ${witchAction === "poison" ? 'bg-purple-600 text-white border-purple-600' : 'border-white/20 text-text-muted hover:text-white'}`}
            >
              DÙNG ĐỘC
            </button>
          </div>
          
          {isTargeting && (
            <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto custom-scrollbar p-1 mt-2 border-t border-white/10 pt-3">
              {alivePlayers.map(p => (
                <button
                  key={p.guestId}
                  onClick={() => setSelectedTarget(p.guestId)}
                  className={`p-2 border rounded-sm transition-all text-left ${selectedTarget === p.guestId ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-white/10 hover:border-purple-500/50 hover:bg-white/5 text-text-secondary'}`}
                >
                  <span className="text-sm font-bold truncate block">{p.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button 
          className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white"
          disabled={isTargeting && !selectedTarget}
          onClick={() => {
            if (witchAction === "save") handleSubmitAction("witch_save", werewolfKillTargetId);
            else if (witchAction === "poison") handleSubmitAction("witch_poison", selectedTarget);
            else handleSubmitAction("witch_skip", null);
          }}
        >
          Xác nhận Lựa Chọn
        </Button>
      </div>
    );
  }

  // Villager or Hunter (Hunter triggers only ON DEATH, not at night)
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-black/40 backdrop-blur-sm border border-white/5 rounded-sm">
      <Moon className="w-12 h-12 text-text-muted animate-pulse mb-4" />
      <h3 className="text-xl font-display text-text-secondary tracking-widest mb-2">ĐÊM YÊN BÌNH</h3>
      <p className="text-sm text-text-muted">Bạn không có năng lực vào ban đêm. Hãy nhắm mắt và mong đợi điều tồi tệ nhất không xảy ra.</p>
    </div>
  );
}
