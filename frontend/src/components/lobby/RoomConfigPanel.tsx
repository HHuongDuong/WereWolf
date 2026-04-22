"use client";

import { useEffect, useState } from "react";
import { RoomConfig } from "@/shared/types/lobby";

interface RoomConfigPanelProps {
  maxPlayers: number;
  config?: RoomConfig;
  onSave: (payload: { maxPlayers: number; config: RoomConfig }) => void;
  disabled?: boolean;
}

const DEFAULT_CONFIG: RoomConfig = {
  guardDuration: 30,
  seerDuration: 30,
  werewolfDuration: 45,
  witchDuration: 30,
  discussDuration: 60,
  voteDuration: 30,
};

type FieldSpec = {
  key: keyof RoomConfig;
  label: string;
  min: number;
  max: number;
};

const FIELD_SPECS: FieldSpec[] = [
  { key: "guardDuration", label: "Guard (s)", min: 20, max: 60 },
  { key: "seerDuration", label: "Seer (s)", min: 20, max: 60 },
  { key: "werewolfDuration", label: "Werewolf (s)", min: 30, max: 60 },
  { key: "witchDuration", label: "Witch (s)", min: 20, max: 60 },
  { key: "discussDuration", label: "Discuss (s)", min: 30, max: 180 },
  { key: "voteDuration", label: "Vote (s)", min: 20, max: 60 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function RoomConfigPanel({ maxPlayers, config, onSave, disabled = false }: RoomConfigPanelProps) {
  const [draftMaxPlayers, setDraftMaxPlayers] = useState(maxPlayers);
  const [draftConfig, setDraftConfig] = useState<RoomConfig>({ ...DEFAULT_CONFIG, ...config });

  useEffect(() => {
    setDraftMaxPlayers(maxPlayers);
  }, [maxPlayers]);

  useEffect(() => {
    setDraftConfig({ ...DEFAULT_CONFIG, ...config });
  }, [config]);

  return (
    <div className="bg-[#151112] border border-[#3A2A1A] rounded-lg p-4">
      <div className="text-xs font-bold tracking-widest text-[#D7C9B8] mb-4">ROOM CONFIG</div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-gray-300 flex flex-col gap-1">
          <span>Max Players</span>
          <input
            type="number"
            min={6}
            max={12}
            value={draftMaxPlayers}
            onChange={(event) => setDraftMaxPlayers(clamp(Number(event.target.value) || 6, 6, 12))}
            disabled={disabled}
            className="bg-[#0A0806] border border-[#2A1A1A] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#A8C0D6]/50 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </label>

        {FIELD_SPECS.map((field) => (
          <label key={field.key} className="text-xs text-gray-300 flex flex-col gap-1">
            <span>{field.label}</span>
            <input
              type="number"
              min={field.min}
              max={field.max}
              value={draftConfig[field.key]}
              onChange={(event) => {
                const nextValue = clamp(Number(event.target.value) || field.min, field.min, field.max);
                setDraftConfig((prev) => ({
                  ...prev,
                  [field.key]: nextValue,
                }));
              }}
              disabled={disabled}
              className="bg-[#0A0806] border border-[#2A1A1A] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#A8C0D6]/50 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </label>
        ))}
      </div>

      {!disabled && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onSave({ maxPlayers: draftMaxPlayers, config: draftConfig })}
            className="px-4 py-2 text-xs font-bold tracking-widest rounded border border-[#A8C0D6]/40 text-[#D7E6F7] hover:bg-[#A8C0D6]/10 transition-colors"
          >
            SAVE CONFIG
          </button>
        </div>
      )}
    </div>
  );
}
