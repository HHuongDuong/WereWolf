"use client";

import { MessageSquare } from "lucide-react";

export function DayPanel() {
  return (
    <div className="mt-10 p-8 rounded-sm border border-white/5 bg-black/40 backdrop-blur-sm shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center mb-4 text-text-muted">
        <MessageSquare className="w-8 h-8 opacity-50" />
      </div>
      <h3 className="text-xl font-display font-bold text-center mb-2 text-white">
        Thời gian thảo luận
      </h3>
      <p className="text-sm text-text-muted text-center max-w-md">
        Hãy thảo luận với mọi người để tìm ra Ma Sói. Vote sẽ bắt đầu sau khi hết thời gian thảo luận.
      </p>
    </div>
  );
}
