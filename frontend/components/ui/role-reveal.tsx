"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { Shield, Eye, Droplet, Target, User, Skull } from "lucide-react";

interface RoleRevealProps {
  role: string | null;
  roomId: string | null;
  onDismiss: () => void;
}

const ROLE_INFO: Record<string, { title: string; subtitle: string; team: "wolf" | "village"; icon: any; color: string; desc: string }> = {
  werewolf: {
    title: "MA SÓI",
    subtitle: "Kẻ săn đêm",
    team: "wolf",
    icon: Skull,
    color: "text-wolf-red",
    desc: "Mỗi đêm, bạn sẽ thức dậy cùng bầy đàn và chọn một mục tiêu để kết liễu. Vào ban ngày, hãy trà trộn vào dân làng, nói dối và đánh lạc hướng họ để bảo vệ bầy đàn."
  },
  villager: {
    title: "DÂN LÀNG",
    subtitle: "Con mồi hay kẻ săn mồi?",
    team: "village",
    icon: User,
    color: "text-village-gold",
    desc: "Bạn không có năng lực đặc biệt nào vào ban đêm. Tuy nhiên, sức mạnh của bạn nằm ở số đông và những cuộc bỏ phiếu biểu quyết vào ban ngày. Hãy tìm ra bầy Sói và treo cổ chúng!"
  },
  seer: {
    title: "TIÊN TRI",
    subtitle: "Kẻ nhìn thấu sự thật",
    team: "village",
    icon: Eye,
    color: "text-blue-400",
    desc: "Mỗi đêm, bạn được phép chọn một người để soi thân phận thật sự của họ. Hãy sử dụng thông tin quý giá này một cách khôn ngoan để dẫn dắt dân làng đến chiến thắng mà không bị Sói ám sát."
  },
  guard: {
    title: "BẢO VỆ",
    subtitle: "Tấm khiên của ngôi làng",
    team: "village",
    icon: Shield,
    color: "text-emerald-500",
    desc: "Mỗi đêm, bạn chọn một người để bảo vệ khỏi sự tấn công của Ma Sói. (Không được bảo vệ một người liên tiếp 2 đêm). Bạn là hy vọng sống sót cuối cùng của những vai trò then chốt."
  },
  witch: {
    title: "PHÙ THỦY",
    subtitle: "Người nắm giữ sinh tử",
    team: "village",
    icon: Droplet,
    color: "text-purple-500",
    desc: "Bạn sở hữu 2 bình thuốc: 1 bình CỨU để hồi sinh người bị sói cắn, và 1 bình ĐỘC để giết chết một người bất kỳ. Bạn chỉ được dùng mỗi bình ĐÚNG MỘT LẦN duy nhất trong toàn bộ ván game."
  },
  hunter: {
    title: "THỢ SĂN",
    subtitle: "Phát súng ân oán",
    team: "village",
    icon: Target,
    color: "text-amber-600",
    desc: "Nếu bạn bị Sói cắn chết hoặc bị Dân làng bỏ phiếu treo cổ, bạn có quyền lập tức nổ phát súng cuối cùng để kéo theo một người bất kỳ bồi táng cùng mình."
  }
};

export function RoleReveal({ role, roomId, onDismiss }: RoleRevealProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (!role || !roomId) return;
    
    // Check if we already revealed this role for this room
    const revealedKey = `revealed_${roomId}`;
    if (localStorage.getItem(revealedKey)) {
      // Already revealed
      return;
    }

    setIsOpen(true);
    // Delay the flip slightly for dramatic effect
    const timer = setTimeout(() => {
      setIsFlipped(true);
      // Mark as revealed
      localStorage.setItem(revealedKey, "true");
    }, 1500);

    return () => clearTimeout(timer);
  }, [role, roomId]);

  if (!isOpen || !role) return null;

  const normalizedRole = role?.toLowerCase() || 'villager';
  const roleData = ROLE_INFO[normalizedRole] || ROLE_INFO['villager'];
  const Icon = roleData.icon;

  const handleUnderstand = () => {
    setIsOpen(false);
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      {/* Background ambient lighting */}
      <div className={`absolute inset-0 opacity-20 pointer-events-none transition-colors duration-1000 ${isFlipped ? (roleData.team === 'wolf' ? 'bg-wolf-red' : 'bg-village-gold') : 'bg-transparent'}`} />
      
      {/* 3D Card Container */}
      <div style={{ perspective: '1000px' }} className="w-full max-w-sm aspect-[2/3]">
        <div 
          className="relative w-full h-full transition-transform duration-1000 transform-style-3d"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transformStyle: 'preserve-3d' }}
        >
          {/* Front (Card Back design) */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-white/10 bg-bg-surface shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Runes / Mystery pattern */}
            <div className="absolute inset-0 bg-[url('/valid_background.jpg')] bg-cover bg-center opacity-30 mix-blend-overlay" />
            <h2 className="text-3xl font-display text-white tracking-[0.2em] z-10 opacity-70 animate-pulse">WEREWOLF</h2>
            <p className="text-xs text-text-secondary mt-4 uppercase tracking-[0.3em] z-10 flex gap-2">
              <span className="dot animate-bounce" style={{animationDelay: '0ms'}}>•</span>
              <span className="dot animate-bounce" style={{animationDelay: '150ms'}}>•</span>
              <span className="dot animate-bounce" style={{animationDelay: '300ms'}}>•</span>
            </p>
          </div>

          {/* Back (Revealed Role) */}
          <div 
            className="absolute inset-0 rounded-xl border border-white/20 bg-gradient-to-b from-bg-elevated to-bg-surface flex flex-col p-6 shadow-2xl overflow-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {/* Thematic glow behind card content */}
            <div className={`absolute -top-32 -inset-x-10 h-64 blur-[80px] rounded-full opacity-30 pointer-events-none ${roleData.team === 'wolf' ? 'bg-wolf-red' : 'bg-village-gold'}`} />
            
            <div className="relative flex-1 flex flex-col items-center text-center mt-8">
              <div className={`p-4 rounded-full border border-white/10 shadow-lg mb-6 ${roleData.team === 'wolf' ? 'bg-wolf-red/10 shadow-wolf-red/20' : 'bg-village-gold/10 shadow-village-gold/20'}`}>
                <Icon className={`w-16 h-16 ${roleData.color}`} />
              </div>
              
              <h2 className={`font-display text-4xl mb-1 ${roleData.color} drop-shadow-md`}>
                {roleData.title}
              </h2>
              <p className="text-sm font-semibold tracking-widest text-text-muted uppercase mb-8">
                &lt; {roleData.subtitle} &gt;
              </p>
              
              <div className="text-sm text-text-secondary leading-relaxed font-body bg-black/30 p-4 rounded-sm border border-white/5">
                {roleData.desc}
              </div>
            </div>

            <div className="relative pt-6">
              <Button 
                variant={roleData.team === 'wolf' ? 'danger' : 'gold'} 
                className="w-full uppercase tracking-widest pt-1" 
                onClick={handleUnderstand}
              >
                Đã Hiểu Mệnh Lệnh
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
