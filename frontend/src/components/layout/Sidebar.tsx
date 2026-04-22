import { Logo } from "./Logo";

export function Sidebar() {
  return (
    <div className="w-72 bg-[#111827] border-r border-white/10 h-screen flex flex-col">
      <div className="p-8">
        <Logo />
      </div>

      <nav className="flex-1 px-6 space-y-1">
        {[
          { label: "Lobby", icon: "🌕", active: true },
          { label: "How to Play", icon: "📜" },
          { label: "Leaderboard", icon: "🏆" },
          { label: "Settings", icon: "⚙️" },
        ].map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-left transition-all
              ${item.active 
                ? "bg-[#7C3AED]/10 text-white" 
                : "hover:bg-white/5 text-[#9CA3AF] hover:text-white"
              }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 text-xs text-[#6B7280] border-t border-white/10">
        Online: <span className="text-[#16A34A]">248</span> players
      </div>
    </div>
  );
}