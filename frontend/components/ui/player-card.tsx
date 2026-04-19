"use client";

import { cn } from "@/lib/utils";
import { Crown, Skull } from "lucide-react";
import Image from "next/image";

export interface PlayerCardProps {
  displayName?: string;
  isHost?: boolean;
  isDead?: boolean;
  isEmpty?: boolean;
  className?: string;
}

export function PlayerCard({ 
  displayName, 
  isHost, 
  isDead, 
  isEmpty, 
  className 
}: PlayerCardProps) {
  
  if (isEmpty || !displayName) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-4 rounded-sm border-2 border-dashed border-bg-elevated/50 bg-bg-surface/20 opacity-50 h-24",
        className
      )}>
        <div className="relative h-6 w-6 mb-2 opacity-30 grayscale mix-blend-screen">
          <Image src="/player_lobby.svg" alt="Empty" fill className="object-contain" />
        </div>
        <span className="text-xs text-text-muted font-body uppercase tracking-wider">Chỗ trống</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative flex flex-col items-center justify-center p-4 rounded-sm border bg-bg-surface/80 backdrop-blur-sm shadow-md transition-all h-24 overflow-hidden",
      isDead 
        ? "border-bg-base bg-bg-base/80 opacity-50 grayscale" 
        : "border-bg-elevated hover:border-text-muted/50",
      className
    )}>
      {isHost && !isDead && (
        <div className="absolute top-2 right-2 text-village-gold z-20">
          <Crown className="h-4 w-4 drop-shadow-[0_0_5px_rgba(243,156,18,0.8)]" />
        </div>
      )}
      
      {isDead && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <Skull className="h-10 w-10 text-danger-red drop-shadow-md opacity-80" />
        </div>
      )}

      <div className={cn(
        "relative h-10 w-10 rounded-sm bg-bg-base flex items-center justify-center mb-2 overflow-hidden shadow-inner",
        isHost && !isDead && "ring-1 ring-village-gold shadow-[0_0_10px_rgba(243,156,18,0.3)] ring-offset-1 ring-offset-bg-base"
      )}>
        <Image 
          src="/player_lobby.svg" 
          alt="Avatar" 
          fill 
          className={cn(
            "object-cover scale-110", 
            isHost && !isDead ? "opacity-100" : "opacity-80 mix-blend-luminosity"
          )} 
        />
      </div>
      
      <span className={cn(
        "text-sm font-medium font-body truncate w-full text-center px-1 z-20 relative",
        isDead ? "text-text-muted line-through" : "text-text-primary",
        isHost && !isDead && "text-village-gold font-bold drop-shadow-md"
      )}>
        {displayName}
      </span>
    </div>
  );
}
