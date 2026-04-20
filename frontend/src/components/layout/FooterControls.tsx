"use client";

export function FooterControls() {
  return (
    <footer className="h-16 border-t border-white/10 bg-[#111827] flex items-center px-8 text-sm">
      <div className="flex-1 flex items-center gap-8 text-[#9CA3AF]">
        <button className="hover:text-white transition-colors">Rules</button>
        <button className="hover:text-white transition-colors">Sound</button>
        <button className="hover:text-white transition-colors">Report Bug</button>
      </div>

      <div className="text-[#6B7280] text-xs font-mono">
        BUILT FOR THE NIGHT • v2026.04
      </div>
    </footer>
  );
}
