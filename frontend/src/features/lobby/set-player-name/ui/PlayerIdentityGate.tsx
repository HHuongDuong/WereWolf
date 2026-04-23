"use client";

import { Flame } from "lucide-react";
import { StartGameButton } from "@/components/lobby/StartGameButton";

interface PlayerIdentityGateProps {
  nameInput: string;
  onNameInputChange: (value: string) => void;
  onConfirm: () => void;
}

export function PlayerIdentityGate({
  nameInput,
  onNameInputChange,
  onConfirm,
}: PlayerIdentityGateProps) {
  return (
    <div className="w-full h-full flex items-center justify-center relative z-10 p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none" />

      <div className="relative z-10 bg-gradient-to-b from-[#1A1210] to-[#0A0505] p-[2px] rounded-2xl shadow-[0_0_80px_rgba(255,69,0,0.15)] animate-[float_6s_ease-in-out_infinite]">
        <div className="bg-[#110C08]/95 p-10 rounded-2xl flex flex-col items-center text-center max-w-md w-full relative overflow-hidden h-full border border-[#FF4500]/20">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-matter.png")' }}
          />

          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-[#FF4500] blur-xl opacity-20 rounded-full" />
            <Flame className="w-12 h-12 text-[#FF4500] relative z-10 animate-[flicker_3s_infinite]" />
          </div>

          <h2 className="text-4xl font-sans text-transparent bg-clip-text bg-gradient-to-b from-brand-moonlight to-gray-400 mb-3 relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Welcome, Wanderer
          </h2>

          <div className="flex items-center gap-3 w-full justify-center mb-8 relative z-10">
            <div className="h-px bg-gradient-to-r from-transparent via-[#FF4500]/50 to-transparent flex-1" />
            <p className="text-[#FF8A00] text-[10px] font-bold tracking-[0.3em] uppercase">Identity Required</p>
            <div className="h-px bg-gradient-to-l from-transparent via-[#FF4500]/50 to-transparent flex-1" />
          </div>

          <p className="text-gray-400 text-sm mb-6 relative z-10 font-accent italic">
            "What name shall the village carve upon your grave if you fall?"
          </p>

          <div className="w-full relative z-10 group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF4500]/0 via-[#FF4500]/30 to-[#FF4500]/0 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <input
              type="text"
              value={nameInput}
              onChange={(event) => onNameInputChange(event.target.value)}
              className="relative w-full bg-[#050303] border border-[#3A2A1A] rounded-lg px-6 py-4 text-center text-2xl text-brand-moonlight focus:outline-none focus:border-[#FF4500]/80 focus:shadow-[0_0_15px_rgba(255,69,0,0.3)] transition-all font-sans placeholder:text-gray-700 placeholder:italic"
              placeholder="Your name..."
              maxLength={16}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter" && nameInput.trim()) {
                  onConfirm();
                }
              }}
            />
          </div>

          <StartGameButton
            onClick={onConfirm}
            disabled={!nameInput.trim()}
            className="w-full relative z-10 font-serif shadow-[0_0_30px_rgba(159,18,57,0.3)]"
          >
            ENTER THE VILLAGE
          </StartGameButton>
        </div>
      </div>
    </div>
  );
}
