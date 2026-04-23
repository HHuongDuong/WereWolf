"use client";

interface ActionPanelProps {
  onLeaveRoom: () => void;
}

export function LobbyActionPanel({ onLeaveRoom }: ActionPanelProps) {
  return (
    <div className="col-span-1 flex flex-col gap-4">
      <button
        onClick={onLeaveRoom}
        className="py-4 px-6 border border-red-900/30 bg-[#0A0505] text-red-700 rounded-lg font-bold tracking-widest text-xs hover:bg-red-950/50 hover:text-red-500 transition-all mt-auto"
      >
        LEAVE THE VILLAGE
      </button>
    </div>
  );
}

export const ActionPanel = LobbyActionPanel;
