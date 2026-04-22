"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { RoleReveal } from "@/components/ui/role-reveal";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { PlayerCard } from "@/components/ui/player-card";
import { Moon, Sun, MessageSquare, LogOut, BookOpen } from "lucide-react";
import { NightPanel } from "@/components/game/NightPanel";
import { DayPanel } from "@/components/game/DayPanel";
import { VotePanel } from "@/components/game/VotePanel";
import { HunterModal } from "@/components/game/HunterModal";
import { EndGameScreen } from "@/components/game/EndGameScreen";
import { ChatBox } from "@/components/game/ChatBox";
import { useGameSocketEmit } from "@/hooks/useGameSocket";

export default function GamePage() {
  const router = useRouter();
  const { emit } = useGameSocketEmit();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const { 
    roomStatus, 
    myRole, 
    roomId, 
    myGuestId,
    players, 
    phase, 
    round,
    deadlineTimestamp,
    deadPlayers,
    hostId,
    isHunterTriggered,
    currentNightRole,
    reset,
  } = useGameStore();

  // Route guarding
  useEffect(() => {
    if (roomStatus === "idle" || !roomId) {
      router.replace("/");
    } else if (roomStatus === "waiting") {
      router.replace("/lobby");
    }
  }, [roomStatus, roomId, router]);

  const handleLeaveGame = () => {
    if (roomId && myGuestId) {
      emit('LEAVE_ROOM', { roomId, guestId: myGuestId });
      reset();
      router.push('/');
    }
  };
  
  // Helper function to get role name in Vietnamese
  const getRoleNameVi = (role: string | null) => {
    if (!role) return '';
    switch (role.toUpperCase()) {
      case 'GUARD': return 'Bảo Vệ';
      case 'SEER': return 'Tiên Tri';
      case 'WEREWOLF': return 'Ma Sói';
      case 'WITCH': return 'Phù Thủy';
      default: return role;
    }
  };
  
  // Get night phase description based on current active role
  const getNightDescription = () => {
    if (!currentNightRole) {
      return 'Đêm đã xuống. Các vai trò đặc biệt hãy thực hiện hành động của mình.';
    }
    
    const roleName = getRoleNameVi(currentNightRole);
    const isMyTurn = myRole && currentNightRole.toUpperCase() === myRole.toUpperCase();
    
    if (isMyTurn) {
      return `Đây là lượt của bạn. Hãy thực hiện hành động của ${roleName}.`;
    } else {
      return `Đang chờ ${roleName} thực hiện hành động...`;
    }
  };

  // Show end screen when game is finished
  if (roomStatus === "finished") {
    return <EndGameScreen />;
  }

  if (roomStatus !== "in_game") {
    return null; // Will redirect shortly
  }

  const isNight = phase === 'night';
  const themeClasses = isNight 
    ? "bg-night-blue/20" 
    : "bg-day-amber/20";

  return (
    <div className="relative h-screen bg-bg-base overflow-hidden flex flex-col font-body">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('/valid_background.jpg')] bg-cover bg-center opacity-[0.15] mix-blend-overlay pointer-events-none" />
      <div className={`absolute inset-0 transition-colors duration-2000 pointer-events-none ${themeClasses}`} />
      
      {/* Role Reveal Overlay (Will only show once due to internal logic) */}
      <RoleReveal role={myRole} roomId={roomId} onDismiss={() => {}} />

      {/* Hunter Modal – appears immediately when hunter is triggered */}
      {isHunterTriggered && <HunterModal />}

      {/* Header */}
      <header className="relative z-10 w-full h-16 flex-shrink-0 border-b border-bg-elevated/80 bg-bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 shadow-md transition-colors duration-1000">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-full border border-white/10 ${isNight ? 'bg-night-purple/50 text-indigo-300' : 'bg-village-gold/20 text-village-gold'}`}>
            {isNight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-wider">
              {isNight ? 'MÀN ĐÊM' : 'BAN NGÀY'}
            </h1>
            <p className="text-xs text-text-muted uppercase font-bold tracking-widest">
              Vòng {round || 1}
            </p>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 top-4">
          {deadlineTimestamp && (
            <CountdownTimer deadlineTimestamp={deadlineTimestamp} label="" className="scale-75 origin-top" />
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowLeaveConfirm(true)}
            className="flex items-center space-x-2 px-3 py-2 text-xs text-text-secondary hover:text-danger-red transition-colors bg-bg-elevated/50 rounded-sm border border-white/5 hover:border-danger-red/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Rời Game</span>
          </button>
          <button 
            onClick={() => setShowRulesModal(true)}
            className="flex items-center space-x-2 px-3 py-2 text-xs text-text-secondary hover:text-village-gold transition-colors bg-bg-elevated/50 rounded-sm border border-white/5 hover:border-village-gold/30"
          >
            <BookOpen className="w-4 h-4" />
            <span>Luật Chơi</span>
          </button>
        </div>
      </header>

      {/* Leave Game Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-bg-surface border border-bg-elevated rounded-sm p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-display font-bold text-white mb-3">
              Rời khỏi trò chơi?
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              Bạn có chắc chắn muốn rời khỏi trò chơi? Hành động này không thể hoàn tác.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 px-4 py-2 bg-bg-elevated hover:bg-bg-elevated/80 text-white rounded-sm border border-white/10 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleLeaveGame}
                className="flex-1 px-4 py-2 bg-danger-red hover:bg-danger-red/90 text-white rounded-sm transition-colors"
              >
                Rời Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border border-bg-elevated rounded-sm max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-bg-elevated flex items-center justify-between flex-shrink-0">
              <h3 className="text-2xl font-display font-bold text-village-gold">
                Luật Chơi Ma Sói
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-text-secondary hover:text-white transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              {/* Game Overview */}
              <div>
                <h4 className="text-lg font-bold text-white mb-2">Tổng Quan</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Ma Sói là trò chơi giữa hai phe: Dân Làng và Ma Sói.
                  <br /><br />
                  Trong bóng tối, Ma Sói ẩn mình giữa Dân Làng... Ban ngày, mọi người tranh luận và treo cổ một người bị nghi ngờ. Ban đêm, Ma Sói lặng lẽ săn mồi, trong khi các vai trò đặc biệt hành động.
                  <br /><br />
                  Hãy suy luận, đánh lừa và sống sót. Phe bạn sẽ chiến thắng… hay bị tiêu diệt?
                  <br /><br />
                  Dân Làng thắng khi loại bỏ hết Ma Sói. Ma Sói thắng khi số lượng của họ bằng hoặc nhiều hơn Dân Làng.
                </p>
              </div>

              {/* Roles */}
              <div>
                <h4 className="text-lg font-bold text-white mb-3">Các Vai Trò</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-bg-elevated/50 rounded border border-danger-red/30">
                    <h5 className="font-bold text-danger-red mb-1">Ma Sói (Werewolf)</h5>
                    <p className="text-xs text-text-secondary">
                      Mỗi đêm, Ma Sói thức dậy và chọn một người để giết. Ban ngày, họ phải ngụy trang như dân làng.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-bg-elevated/50 rounded border border-white/10">
                    <h5 className="font-bold text-white mb-1">Dân Làng (Villager)</h5>
                    <p className="text-xs text-text-secondary">
                      Không có khả năng đặc biệt. Hãy thảo luận và bỏ phiếu để tìm ra Ma Sói.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-bg-elevated/50 rounded border border-blue-500/30">
                    <h5 className="font-bold text-blue-400 mb-1">Tiên Tri (Seer)</h5>
                    <p className="text-xs text-text-secondary">
                      Mỗi đêm có thể xem vai trò của một người chơi để biết họ là Ma Sói hay không.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-bg-elevated/50 rounded border border-green-500/30">
                    <h5 className="font-bold text-green-400 mb-1">Bảo Vệ (Guard)</h5>
                    <p className="text-xs text-text-secondary">
                      Mỗi đêm có thể bảo vệ một người khỏi Ma Sói. Không thể bảo vệ cùng một người 2 đêm liên tiếp.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-bg-elevated/50 rounded border border-purple-500/30">
                    <h5 className="font-bold text-purple-400 mb-1">Phù Thủy (Witch)</h5>
                    <p className="text-xs text-text-secondary">
                      Có 1 lọ thuốc cứu (hồi sinh người bị Ma Sói giết) và 1 lọ thuốc độc (giết một người). Mỗi lọ chỉ dùng 1 lần.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-bg-elevated/50 rounded border border-orange-500/30">
                    <h5 className="font-bold text-orange-400 mb-1">Thợ Săn (Hunter)</h5>
                    <p className="text-xs text-text-secondary">
                      Khi chết (bị giết hoặc bị treo cổ), có thể bắn một người bất kỳ theo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Game Flow */}
              <div>
                <h4 className="text-lg font-bold text-white mb-2">Luồng Chơi</h4>
                <div className="space-y-2 text-sm text-text-secondary">
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-white">1.</span>
                    <p>Ban Đêm: Các vai trò đặc biệt thực hiện hành động (Bảo Vệ → Tiên Tri → Ma Sói → Phù Thủy)</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-white">2.</span>
                    <p>Ban Ngày: Tất cả thức dậy, thảo luận và tìm ra Ma Sói</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-white">3.</span>
                    <p>Bỏ Phiếu: Mọi người bỏ phiếu treo cổ một người (người có nhiều phiếu nhất sẽ chết)</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-white">4.</span>
                    <p>Lặp Lại: Quay lại ban đêm cho đến khi một phe thắng</p>
                  </div>
                </div>
              </div>

              {/* Win Conditions */}
              <div>
                <h4 className="text-lg font-bold text-white mb-2">Điều Kiện Thắng</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-village-gold/10 rounded border border-village-gold/30">
                    <p className="text-village-gold font-bold mb-1">Dân Làng Thắng:</p>
                    <p className="text-text-secondary text-xs">Khi tất cả Ma Sói đã bị treo cổ</p>
                  </div>
                  <div className="p-3 bg-danger-red/10 rounded border border-danger-red/30">
                    <p className="text-danger-red font-bold mb-1">Ma Sói Thắng:</p>
                    <p className="text-text-secondary text-xs">Khi số Ma Sói ≥ số Dân Làng còn sống</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-bg-elevated flex-shrink-0">
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-full px-4 py-2 bg-village-gold hover:bg-village-gold/90 text-bg-base font-bold rounded-sm transition-colors"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area - 3 Column Layout */}
      <div className="relative z-10 flex-1 flex overflow-hidden min-h-0">
        
        {/* Left Sidebar - Role Rules + Chat */}
        <aside className="w-96 border-r border-bg-elevated/80 bg-bg-surface/50 backdrop-blur-sm flex flex-col overflow-hidden">
          {/* Role Rules Section */}
          <div className="border-b border-bg-elevated/50 p-4 flex-shrink-0">
            <h3 className="text-sm font-display font-bold text-village-gold uppercase tracking-widest mb-3">
              Vai trò của bạn
            </h3>
            <div className="space-y-2 text-xs text-text-secondary">
              {myRole && (
                <div className="p-3 bg-bg-elevated/50 rounded border border-white/5">
                  <p className="font-bold text-white mb-1">{myRole}</p>
                  <p className="text-[10px] leading-relaxed">
                    {myRole === 'WEREWOLF' && 'Bạn là Ma Sói. Hãy giết dân làng vào ban đêm và ngụy trang vào ban ngày.'}
                    {myRole === 'VILLAGER' && 'Bạn là Dân Làng. Hãy tìm ra Ma Sói và bỏ phiếu treo cổ họ.'}
                    {myRole === 'SEER' && 'Bạn là Tiên Tri. Mỗi đêm bạn có thể xem vai trò của một người chơi.'}
                    {myRole === 'GUARD' && 'Bạn là Bảo Vệ. Mỗi đêm bạn có thể bảo vệ một người khỏi Ma Sói.'}
                    {myRole === 'WITCH' && 'Bạn là Phù Thủy. Bạn có 1 lọ thuốc cứu và 1 lọ thuốc độc.'}
                    {myRole === 'HUNTER' && 'Bạn là Thợ Săn. Khi chết, bạn có thể bắn một người theo.'}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Box */}
          <div className="flex-1 overflow-hidden min-h-0">
            <ChatBox />
          </div>
        </aside>

        {/* Center - Main Play Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
          <div className="max-w-2xl w-full text-center space-y-6">
            <h2 className="font-display text-3xl font-bold text-white tracking-widest drop-shadow-md">
              {phase === 'night' && currentNightRole && `LƯỢT ${getRoleNameVi(currentNightRole).toUpperCase()}`}
              {phase === 'night' && !currentNightRole && 'HÃY NHẮM MẮT LẠI...'}
              {phase === 'day' && 'BAN NGÀY - THẢO LUẬN'}
              {phase === 'vote' && 'BÌNH CHỌN TREO CỔ'}
              {!phase && 'ĐANG CHUẨN BỊ...'}
            </h2>
            <p className="text-text-secondary font-body leading-relaxed max-w-lg mx-auto">
              {phase === 'night' && getNightDescription()}
              {phase === 'day' && 'Hãy thảo luận và tìm ra Ma Sói trong số các bạn.'}
              {phase === 'vote' && 'Đã đến lúc bỏ phiếu. Click vào người chơi bên phải để vote.'}
              {!phase && 'Trò chơi đang được khởi tạo...'}
            </p>
            
            {/* Action Panel */}
            {phase === 'night' && <NightPanel />}
            {phase === 'day' && <DayPanel />}
            {phase === 'vote' && <VotePanel />}
            
            {!phase && (
              <div className="mt-10 p-8 rounded-sm border border-white/5 bg-black/40 backdrop-blur-sm shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center mb-4 text-text-muted animate-pulse">
                  <MessageSquare className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm uppercase tracking-widest text-text-muted font-bold">
                  Đang khởi tạo phase...
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - Player List (Clickable) */}
        <aside className="w-48 border-l border-bg-elevated/80 bg-bg-surface/50 backdrop-blur-sm flex flex-col overflow-hidden shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
          <div className="p-2 border-b border-bg-elevated/50 flex-shrink-0">
            <h3 className="text-[10px] font-display font-bold text-text-muted uppercase tracking-widest text-center">
              Dân Làng ({players.filter(p => !deadPlayers.includes(p.guestId)).length}/{players.length})
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5 min-h-0">
            {players.map((player) => {
              const isMe = player.guestId === myGuestId;
              const isDead = deadPlayers.includes(player.guestId);
              
              return (
                <div key={player.guestId} className={`relative transition-all duration-300 ${isDead ? 'opacity-40 grayscale' : 'hover:-translate-y-0.5 cursor-pointer'}`}>
                  <PlayerCard
                    displayName={player.displayName}
                    isHost={player.guestId === hostId}
                    isDead={isDead}
                    isDisconnected={player.isDisconnected}
                  />
                  {isMe && !isDead && (
                    <div className="absolute -inset-0.5 border border-village-gold/30 rounded-sm pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>
        </aside>
        
      </div>
      {/* End of Main Content Area */}
      
    </div>
  );
}
