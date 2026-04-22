"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { useGameSocketEmit } from "@/hooks/useGameSocket";
import { Shield, Eye, Skull, Droplet, CheckCircle, XCircle } from "lucide-react";

// Helper functions
const getRoleIcon = (role: string) => {
  switch (role.toUpperCase()) {
    case 'GUARD': return <Shield className="w-8 h-8" />;
    case 'SEER': return <Eye className="w-8 h-8" />;
    case 'WEREWOLF': return <Skull className="w-8 h-8" />;
    case 'WITCH': return <Droplet className="w-8 h-8" />;
    default: return null;
  }
};

const getRoleName = (role: string) => {
  switch (role.toUpperCase()) {
    case 'GUARD': return 'Bảo Vệ';
    case 'SEER': return 'Tiên Tri';
    case 'WEREWOLF': return 'Ma Sói';
    case 'WITCH': return 'Phù Thủy';
    default: return role;
  }
};

const getRoleAction = (role: string) => {
  switch (role.toUpperCase()) {
    case 'GUARD': return 'Chọn người để bảo vệ';
    case 'SEER': return 'Chọn người để xem vai trò';
    case 'WEREWOLF': return 'Chọn mục tiêu để giết';
    case 'WITCH': return 'Chọn người để cứu/độc';
    default: return 'Chọn mục tiêu';
  }
};

export function NightPanel() {
  const { myRole, players, deadPlayers, myGuestId, seerResult, werewolfKillTargetId, witchPotions, currentNightRole } = useGameStore();
  const { emit } = useGameSocketEmit();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [actionSent, setActionSent] = useState(false);
  const [witchAction, setWitchAction] = useState<'save' | 'poison' | 'skip' | null>(null);

  // Reset actionSent when currentNightRole changes (new role's turn)
  useEffect(() => {
    setActionSent(false);
    setSelectedTarget(null);
    setWitchAction(null);
  }, [currentNightRole]);

  const alivePlayers = players.filter(p => !deadPlayers.includes(p.guestId) && p.guestId !== myGuestId);
  
  // Check if it's my turn
  const isMyTurn = currentNightRole && myRole && currentNightRole.toUpperCase() === myRole.toUpperCase();

  const handleSubmit = () => {
    if (!selectedTarget || actionSent) return;

    emit('night_action', {
      role: myRole?.toUpperCase(),
      targetId: selectedTarget,
    });

    setActionSent(true);
  };
  
  const handleWitchAction = () => {
    if (!witchAction || actionSent) return;
    
    if (witchAction === 'skip') {
      // Skip - don't send any action, just mark as done
      setActionSent(true);
      return;
    }
    
    if (witchAction === 'save') {
      // Save - send null targetId to indicate saving werewolf's victim
      emit('night_action', {
        role: 'WITCH',
        targetId: null, // null means save
      });
    } else if (witchAction === 'poison') {
      // Poison - send selected target
      emit('night_action', {
        role: 'WITCH',
        targetId: selectedTarget,
      });
    }
    
    setActionSent(true);
  };

  // Only show panel for roles that have night actions
  if (!myRole || !['GUARD', 'SEER', 'WEREWOLF', 'WITCH'].includes(myRole.toUpperCase())) {
    return (
      <div className="mt-10 p-8 rounded-sm border border-white/5 bg-black/40 backdrop-blur-sm shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-sm uppercase tracking-widest text-text-muted font-bold">
          Chờ các vai trò khác hành động...
        </p>
      </div>
    );
  }
  
  // Show waiting message if it's not my turn
  if (!isMyTurn) {
    return (
      <div className="mt-10 p-8 rounded-sm border border-white/5 bg-black/40 backdrop-blur-sm shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center mb-4 text-text-muted opacity-30 animate-pulse">
          <span className="text-4xl">🌙</span>
        </div>
        <p className="text-sm uppercase tracking-widest text-text-muted font-bold mb-2">
          Đêm đang diễn ra...
        </p>
        <p className="text-xs text-text-muted">
          Hãy kiên nhẫn chờ đợi lượt của bạn
        </p>
      </div>
    );
  }

  if (actionSent) {
    // Special display for Seer showing the result
    if (myRole.toUpperCase() === 'SEER' && seerResult) {
      const targetPlayer = players.find(p => p.guestId === seerResult.targetId);
      
      return (
        <div className={`mt-10 p-8 rounded-sm border ${seerResult.isWerewolf ? 'border-danger-red/30 bg-danger-red/10' : 'border-green-500/30 bg-green-500/10'} backdrop-blur-sm shadow-2xl flex flex-col items-center justify-center min-h-[300px]`}>
          <div className={`w-16 h-16 rounded-full border-2 ${seerResult.isWerewolf ? 'border-danger-red/50' : 'border-green-500/50'} flex items-center justify-center mb-4 ${seerResult.isWerewolf ? 'text-danger-red' : 'text-green-400'}`}>
            {seerResult.isWerewolf ? <XCircle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
          </div>
          <p className={`text-lg font-bold mb-2 ${seerResult.isWerewolf ? 'text-danger-red' : 'text-green-400'}`}>
            {targetPlayer?.displayName || 'Người chơi'}
          </p>
          <p className={`text-sm uppercase tracking-widest font-bold ${seerResult.isWerewolf ? 'text-danger-red' : 'text-green-400'}`}>
            {seerResult.isWerewolf ? 'LÀ MA SÓI!' : 'LÀ DÂN LÀNG'}
          </p>
          <p className="text-xs text-text-muted mt-4">
            Chờ các vai trò khác...
          </p>
        </div>
      );
    }
    
    return (
      <div className="mt-10 p-8 rounded-sm border border-green-500/30 bg-black/40 backdrop-blur-sm shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full border-2 border-green-500/50 flex items-center justify-center mb-4 text-green-400">
          {getRoleIcon(myRole)}
        </div>
        <p className="text-sm uppercase tracking-widest text-green-400 font-bold">
          Hành động đã được ghi nhận
        </p>
        <p className="text-xs text-text-muted mt-2">
          Chờ các vai trò khác...
        </p>
      </div>
    );
  }

  // Special UI for Witch
  if (myRole.toUpperCase() === 'WITCH' && !actionSent) {
    const wolfVictim = werewolfKillTargetId ? players.find(p => p.guestId === werewolfKillTargetId) : null;
    const canSave = witchPotions?.hasSavePotion && werewolfKillTargetId;
    const canPoison = witchPotions?.hasKillPotion;
    
    return (
      <div className="mt-10 p-8 rounded-sm border border-purple-500/30 bg-black/40 backdrop-blur-sm shadow-2xl min-h-[300px]">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-full border-2 border-purple-400/50 flex items-center justify-center text-purple-400">
            <Droplet className="w-8 h-8" />
          </div>
        </div>

        <h3 className="text-xl font-display font-bold text-center mb-2 text-white">
          Lựa chọn của Phù Thủy
        </h3>
        
        {/* Show werewolf victim */}
        {wolfVictim && (
          <div className="mb-4 p-3 rounded-sm bg-danger-red/10 border border-danger-red/30">
            <p className="text-xs text-text-muted text-center mb-1">Nạn nhân của Ma Sói:</p>
            <p className="text-sm font-bold text-danger-red text-center">{wolfVictim.displayName}</p>
            <p className="text-[10px] text-text-muted text-center mt-1 italic">đang đứng trước ranh giới sinh tử</p>
          </div>
        )}
        
        {!wolfVictim && (
          <div className="mb-4 p-3 rounded-sm bg-bg-elevated/50 border border-white/10">
            <p className="text-xs text-text-muted text-center">Ma Sói không chọn ai đêm nay</p>
          </div>
        )}

        {/* Potion status */}
        <div className="mb-6 flex gap-2 justify-center">
          <div className={`px-3 py-1 rounded-sm text-xs ${canSave ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-bg-elevated/50 text-text-muted border border-white/10'}`}>
            Thuốc Cứu {canSave ? '✓' : '✗'}
          </div>
          <div className={`px-3 py-1 rounded-sm text-xs ${canPoison ? 'bg-danger-red/20 text-danger-red border border-danger-red/30' : 'bg-bg-elevated/50 text-text-muted border border-white/10'}`}>
            Thuốc Độc {canPoison ? '✓' : '✗'}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {canSave && (
            <button
              onClick={() => setWitchAction('save')}
              className={`w-full py-3 rounded-sm border transition-all ${
                witchAction === 'save'
                  ? 'border-green-500 bg-green-500/20 text-green-400'
                  : 'border-white/10 bg-bg-elevated/50 text-text-secondary hover:border-green-500/50'
              }`}
            >
              <span className="font-bold">Cứu {wolfVictim?.displayName}</span>
            </button>
          )}
          
          {canPoison && (
            <div>
              <button
                onClick={() => setWitchAction('poison')}
                className={`w-full py-3 rounded-sm border transition-all ${
                  witchAction === 'poison'
                    ? 'border-danger-red bg-danger-red/20 text-danger-red'
                    : 'border-white/10 bg-bg-elevated/50 text-text-secondary hover:border-danger-red/50'
                }`}
              >
                <span className="font-bold">Sử dụng Thuốc Độc</span>
              </button>
              
              {witchAction === 'poison' && (
                <div className="mt-3 grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {alivePlayers.map((player) => (
                    <button
                      key={player.guestId}
                      onClick={() => setSelectedTarget(player.guestId)}
                      className={`p-2 rounded-sm border text-xs transition-all ${
                        selectedTarget === player.guestId
                          ? 'border-danger-red bg-danger-red/20 text-white'
                          : 'border-white/10 bg-bg-elevated/50 text-text-secondary hover:border-white/30'
                      }`}
                    >
                      {player.displayName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={() => setWitchAction('skip')}
            className={`w-full py-3 rounded-sm border transition-all ${
              witchAction === 'skip'
                ? 'border-white/30 bg-white/10 text-white'
                : 'border-white/10 bg-bg-elevated/50 text-text-muted hover:border-white/20'
            }`}
          >
            Bỏ qua
          </button>
        </div>

        <button
          onClick={handleWitchAction}
          disabled={!witchAction || (witchAction === 'poison' && !selectedTarget)}
          className={`mt-6 w-full py-3 rounded-sm font-bold uppercase tracking-wider transition-all ${
            witchAction && (witchAction !== 'poison' || selectedTarget)
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-bg-elevated text-text-muted cursor-not-allowed'
          }`}
        >
          Xác nhận
        </button>
      </div>
    );
  }

  // Default UI for Guard, Seer, Werewolf
  return (
    <div className="mt-10 p-8 rounded-sm border border-white/10 bg-black/40 backdrop-blur-sm shadow-2xl min-h-[300px]">
      <div className="flex items-center justify-center mb-6">
        <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-white">
          {getRoleIcon(myRole)}
        </div>
      </div>

      <h3 className="text-xl font-display font-bold text-center mb-2 text-white">
        {myRole.toUpperCase() === 'GUARD' && 'Chọn người để bảo vệ'}
        {myRole.toUpperCase() === 'SEER' && 'Chọn người để xem vai trò'}
        {myRole.toUpperCase() === 'WEREWOLF' && 'Chọn mục tiêu'}
      </h3>
      <p className="text-xs text-text-muted text-center mb-6">
        Chọn một người từ danh sách bên dưới
      </p>

      <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
        {alivePlayers.map((player) => (
          <button
            key={player.guestId}
            onClick={() => setSelectedTarget(player.guestId)}
            className={`p-3 rounded-sm border transition-all ${
              selectedTarget === player.guestId
                ? 'border-village-gold bg-village-gold/20 text-white'
                : 'border-white/10 bg-bg-elevated/50 text-text-secondary hover:border-white/30 hover:text-white'
            }`}
          >
            <p className="text-sm font-medium truncate">{player.displayName}</p>
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedTarget}
        className={`mt-6 w-full py-3 rounded-sm font-bold uppercase tracking-wider transition-all ${
          selectedTarget
            ? 'bg-village-gold text-bg-base hover:bg-village-gold/90'
            : 'bg-bg-elevated text-text-muted cursor-not-allowed'
        }`}
      >
        Xác nhận
      </button>
    </div>
  );
}
