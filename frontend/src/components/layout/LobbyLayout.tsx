"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { Moon, Bell, Settings } from "lucide-react";

interface LobbyLayoutProps {
  children: ReactNode;
  playerName?: string | null;
  title?: string;
}

export function LobbyLayout({ children, playerName, title }: LobbyLayoutProps) {

  return (
    <div className="h-screen bg-brand-background text-white font-sans overflow-hidden flex flex-col relative select-none">

      {/* Background Layers (Village & Forest & Fog) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Base Image Background */}
        <Image
          src="/images/background/background_lobby.jpg"
          alt="Moonlit Village Square"
          fill
          priority
          unoptimized={true}
          className="object-cover object-center"
        />

        {/* Moon Glow Enhancement */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-moonlight rounded-full blur-[120px] opacity-20 mix-blend-screen pointer-events-none" />

        {/* Subtle overlay for better contrast (reduced so the image is clear) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B12] via-[#0B0B12]/40 to-transparent opacity-50 pointer-events-none" />
      </div>

      {/* Header (Transparent overlay) */}
      <header className="h-20 flex items-center justify-between px-10 z-20 bg-gradient-to-b from-black/60 to-transparent">
        {/* Left */}
        <div className="flex items-center gap-3 w-1/3">
          <Moon className="w-8 h-8 text-brand-moonlight drop-shadow-[0_0_8px_rgba(168,192,214,0.8)]" />
          <span className="text-xl font-serif font-bold text-white tracking-widest drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]">
            Werewolf Online
          </span>
        </div>

        {/* Center */}
        <div className="flex flex-col items-center w-1/3">
          <div className="text-brand-moonlight text-sm tracking-widest font-semibold animate-pulse drop-shadow-[0_0_5px_rgba(168,192,214,0.6)]">
            {title || "312 VILLAGERS AWAKE TONIGHT"}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center justify-end gap-6 w-1/3">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-bold tracking-wide uppercase">{playerName || "Wanderer"}</div>
              <div className="text-xs text-brand-moonlight">Villager</div>
            </div>
            <div className="relative cursor-pointer group">
              <div className="w-12 h-12 bg-gray-800 rounded-full border border-brand-moonlight/40 overflow-hidden shadow-[0_0_15px_rgba(168,192,214,0.3)] group-hover:shadow-[0_0_20px_rgba(168,192,214,0.6)] transition-all">
                <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
            <button className="text-brand-moonlight/60 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all"><Bell className="w-5 h-5" /></button>
            <button className="text-brand-moonlight/60 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all"><Settings className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full relative z-10 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
