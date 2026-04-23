"use client";

import { useState } from "react";

interface RoomHeaderProps {
  name: string;
  code: string;
  hostName: string;
  currentPlayers: number;
  maxPlayers: number;
  status?: string;
}

export function RoomHeader({
  name,
  code,
  hostName,
  currentPlayers,
  maxPlayers,
  status,
}: RoomHeaderProps) {
  const shortCode = code.split("-")[1] || code;
  const labelStatus = (status || "waiting").replaceAll("_", " ");
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative border border-white/10 bg-black/50 backdrop-blur-md px-6 py-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }} />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-moonlight/50 to-transparent" />
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,rgba(168,192,214,0.1),transparent_70%)]" />

      <div className="relative z-10 flex items-center justify-between gap-6">
        <div className="min-w-0 flex items-center gap-4">
          <div className="text-sm font-bold text-gray-300 whitespace-nowrap tracking-wider flex items-center gap-2">
            ROOM <span 
              onClick={handleCopyCode}
              className="text-brand-moonlight drop-shadow-[0_0_5px_rgba(168,192,214,0.5)] hover:text-red-500 hover:drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] cursor-pointer transition-colors"
              title={copied ? "Copied!" : "Click to copy room code"}
            >
              #{shortCode}
            </span>
            <span className="inline-block w-4">
              {copied && (
                <span className="text-xs text-green-400 animate-pulse">✓</span>
              )}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-400 truncate tracking-wide border-l border-white/10 pl-4">
            <span className="opacity-60 uppercase text-[10px]">Host</span>
            <span className="text-gray-200 font-semibold truncate text-sm">{hostName}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-sm text-gray-300 font-serif whitespace-nowrap hidden sm:block">
            <span className="text-white font-bold">{currentPlayers}</span> / {maxPlayers} Players
          </div>
          <div className="text-xs text-gray-300 sm:hidden whitespace-nowrap">
            {currentPlayers}/{maxPlayers}
          </div>
          <span className="px-3 py-1.5 rounded-full border border-brand-moonlight/30 bg-brand-moonlight/10 text-[10px] font-bold tracking-[0.2em] text-brand-moonlight uppercase shadow-[0_0_15px_rgba(168,192,214,0.15)]">
            {labelStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
