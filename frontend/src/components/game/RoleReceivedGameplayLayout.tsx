"use client";

import { useEffect, useMemo, useState } from "react";
import { ChatBox } from "@/components/game/chat/ChatBox";
import { Avatar } from "@/components/ui/Avatar";
import { GamePhase, Player, Role } from "@/shared/types/game";
import { Message } from "@/components/game/chat/types";
import { roleCardFrontImageByRole } from "@/shared/lib/roleCardAssets";
import { ActionResultToast } from "@/components/game/actions/ActionResultToast";

interface RoleReceivedGameplayLayoutProps {
  players: Player[];
  playerName: string;
  currentRole: Role;
  phase: GamePhase;
  day: number;
  deadlineTimestamp: number | null;
  hasActed: boolean;
}

const TOP_SLOT_COUNT = 6;
const OUTER_RING_MAX = 11;

function createSeatPool(players: Player[], playerName: string): Player[] {
  const normalizedName = playerName.trim().toLowerCase();
  return players.filter((player) => player.name.trim().toLowerCase() !== normalizedName);
}

function getActionLabel(phase: GamePhase, role: Role): string {
  if (phase === GamePhase.NIGHT) {
    return role === Role.WEREWOLF ? "Choose Night Target" : "Use Night Ability";
  }
  if (phase === GamePhase.VOTING) {
    return "Cast Vote";
  }
  return "Open Action Panel";
}

function isRoleTurn(role: Role, phase: GamePhase): boolean {
  if (phase === GamePhase.NIGHT) {
    return (
      role === Role.WEREWOLF ||
      role === Role.SEER ||
      role === Role.WITCH ||
      role === Role.GUARD ||
      role === Role.HUNTER
    );
  }
  if (phase === GamePhase.VOTING) {
    return true;
  }
  return false;
}

type RoleAction = {
  key: string;
  label: string;
  requiresTarget?: boolean;
};

function roleHasAbility(role: Role): boolean {
  return role !== Role.VILLAGER;
}

function getRoleActions(role: Role): RoleAction[] {
  if (role === Role.WEREWOLF) return [{ key: "devour", label: "Devour", requiresTarget: true }];
  if (role === Role.SEER) return [{ key: "prophesy", label: "Prophesy", requiresTarget: true }];
  if (role === Role.WITCH)
    return [
      { key: "heal", label: "Heal" },
      { key: "poison", label: "Poison", requiresTarget: true },
    ];
  if (role === Role.GUARD) return [{ key: "protect", label: "Protect", requiresTarget: true }];
  if (role === Role.HUNTER) return [{ key: "shoot", label: "Shoot", requiresTarget: true }];
  return [{ key: "none", label: "No ability (placeholder)" }];
}

function Seat({
  label,
  player,
  isSelected,
  isEnabled,
  onSelect,
}: {
  label: string;
  player: Player;
  isSelected: boolean;
  isEnabled: boolean;
  onSelect: (playerId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(player.id)}
      disabled={!isEnabled}
      className={[
        "group relative mx-auto aspect-square w-full max-w-[92px] rounded-lg border backdrop-blur-[2px] p-2 text-left transition",
        isSelected
          ? "border-[#C4B5FD]/70 shadow-[0_0_0_1px_rgba(196,181,253,0.4),0_0_24px_rgba(124,58,237,0.25)]"
          : "border-white/12",
        isEnabled ? "hover:border-[#7C3AED]/55" : "cursor-not-allowed opacity-55",
      ].join(" ")}
    >
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF]">{label}</p>
      <div className="mt-2 flex h-[calc(100%-1rem)] flex-col items-center justify-center gap-1.5 text-center">
        <Avatar name={player.name} isDead={!player.isAlive} size="sm" shape="circle" />
        <p className="line-clamp-2 text-xs font-medium text-[#E5E7EB]">{player.name}</p>
      </div>

      {isSelected && (
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_center,rgba(196,181,253,0.22),transparent_60%)]" />
      )}
      {isEnabled && !isSelected && (
        <div className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.16),transparent_60%)]" />
      )}
    </button>
  );
}

export function RoleReceivedGameplayLayout({
  players,
  playerName,
  currentRole,
  phase,
  day,
  deadlineTimestamp,
  hasActed,
}: RoleReceivedGameplayLayoutProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "sys-1",
      type: "system",
      subtype: "normal",
      content: "The village has gathered. Discuss before making your move.",
      timestamp: new Date().toISOString(),
    },
  ]);

  const topAndBottomPlayers = useMemo(() => createSeatPool(players, playerName), [playerName, players]);
  const outerRingPlayers = topAndBottomPlayers.slice(0, OUTER_RING_MAX);
  const topPlayers = outerRingPlayers.slice(0, TOP_SLOT_COUNT);
  const bottomPlayers = outerRingPlayers.slice(TOP_SLOT_COUNT, OUTER_RING_MAX);
  const actionLabel = getActionLabel(phase, currentRole);
  const myTurn = isRoleTurn(currentRole, phase);
  const canAct = myTurn && !hasActed;
  const roleActions = getRoleActions(currentRole);
  const isAbilityRole = roleHasAbility(currentRole);
  const canSelectTarget = canAct && isAbilityRole;
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    isVisible: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ isVisible: false, type: "info", message: "" });
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    setSelectedTargetId(null);
  }, [phase, currentRole]);

  useEffect(() => {
    if (!deadlineTimestamp) {
      setSecondsLeft(null);
      return;
    }
    const tick = () => {
      const remainingMs = deadlineTimestamp - Date.now();
      setSecondsLeft(Math.max(0, Math.ceil(remainingMs / 1000)));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadlineTimestamp]);

  useEffect(() => {
    if (!toast.isVisible) return;
    const timer = setTimeout(() => setToast((prev) => ({ ...prev, isVisible: false })), 2200);
    return () => clearTimeout(timer);
  }, [toast.isVisible]);

  const selectedTarget = useMemo(() => {
    if (!selectedTargetId) return null;
    return players.find((p) => p.id === selectedTargetId) ?? null;
  }, [players, selectedTargetId]);

  const performAction = (action: RoleAction) => {
    if (!canAct) {
      setToast({ isVisible: true, type: "info", message: "Not your turn yet." });
      return;
    }
    if (!isAbilityRole) {
      setToast({ isVisible: true, type: "info", message: "Villager has no active ability (placeholder)." });
      return;
    }
    if (action.requiresTarget && !selectedTargetId) {
      setToast({ isVisible: true, type: "error", message: "Select a target first." });
      return;
    }

    const targetName = selectedTarget?.name;
    const suffix = action.requiresTarget && targetName ? ` → ${targetName}` : "";
    setToast({ isVisible: true, type: "success", message: `${action.label}${suffix}` });
  };

  const handleSendMessage = (content: string, channel: "global" | "werewolf" = "global") => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        sender: playerName,
        content,
        timestamp: new Date().toISOString(),
        isOwn: true,
        type: "message",
        channel,
      },
    ]);
  };

  return (
    <div className="-mt-8 space-y-4">
      <ActionResultToast
        isVisible={toast.isVisible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
      <section className="rounded-2xl border border-white/12 px-5 py-4 text-center backdrop-blur-[2px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#9CA3AF]">Day {day}</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#9CA3AF]">Phase State</p>
            <p className="mt-1 text-lg font-semibold text-[#E5E7EB]">{phase}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#9CA3AF]">Timer</p>
            <p className="mt-1 font-mono text-2xl font-bold text-[#C4B5FD]">
              {secondsLeft === null ? "--:--" : `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_450px]">
        <div className="rounded-2xl border border-white/12 p-4 backdrop-blur-[2px]">
          <div className="grid gap-4 lg:grid-cols-[0.72fr_1.56fr_0.72fr]">
            <div className="grid grid-cols-1 gap-3">
              {topPlayers[0] && (
                <Seat
                  label="P1"
                  player={topPlayers[0]}
                  isSelected={selectedTargetId === topPlayers[0].id}
                  isEnabled={canSelectTarget}
                  onSelect={setSelectedTargetId}
                />
              )}
              {topPlayers[1] && (
                <Seat
                  label="P2"
                  player={topPlayers[1]}
                  isSelected={selectedTargetId === topPlayers[1].id}
                  isEnabled={canSelectTarget}
                  onSelect={setSelectedTargetId}
                />
              )}
              {topPlayers[2] && (
                <Seat
                  label="P3"
                  player={topPlayers[2]}
                  isSelected={selectedTargetId === topPlayers[2].id}
                  isEnabled={canSelectTarget}
                  onSelect={setSelectedTargetId}
                />
              )}
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-[#7C3AED]/40 p-4 text-center backdrop-blur-[2px]">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#C4B5FD]">Center</p>
                <div className="mt-3 flex items-center justify-center">
                  <div className="relative w-52 overflow-visible rounded-lg border border-white/20 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
                    <img
                      src={roleCardFrontImageByRole[currentRole]}
                      alt={`${currentRole} role card`}
                      decoding="sync"
                      className="h-auto w-full object-cover"
                    />
                    <div className="absolute -bottom-4 -right-4 rounded-2xl border border-white/20 bg-[#0F172A] p-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.45)]">
                      <Avatar name={playerName} size="sm" shape="circle" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#7C3AED]/35 p-4 backdrop-blur-[2px]">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#C4B5FD]">Action Panel</p>
                  <span className={`text-xs font-semibold ${canAct ? "text-[#4ADE80]" : "text-[#F59E0B]"}`}>
                    {canAct ? "Your turn" : hasActed ? "Already acted" : "Wait turn"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#E5E7EB]">{actionLabel}</p>
                {canSelectTarget && (
                  <p className="mt-1 text-xs text-[#9CA3AF]">
                    Target:{" "}
                    <span className="font-semibold text-[#E5E7EB]">
                      {selectedTarget ? selectedTarget.name : "—"}
                    </span>
                  </p>
                )}
                <div className="mt-3 space-y-2">
                  {roleActions.map((action) => (
                    <button
                      key={action.key}
                      type="button"
                      onClick={() => performAction(action)}
                      disabled={!canAct || (action.requiresTarget && !selectedTargetId) || !isAbilityRole}
                      className="w-full rounded-lg border border-white/15 px-3 py-2 text-left text-sm text-[#E5E7EB] transition enabled:hover:border-[#7C3AED]/60 enabled:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {topPlayers[3] && (
                <Seat
                  label="P4"
                  player={topPlayers[3]}
                  isSelected={selectedTargetId === topPlayers[3].id}
                  isEnabled={canSelectTarget}
                  onSelect={setSelectedTargetId}
                />
              )}
              {topPlayers[4] && (
                <Seat
                  label="P5"
                  player={topPlayers[4]}
                  isSelected={selectedTargetId === topPlayers[4].id}
                  isEnabled={canSelectTarget}
                  onSelect={setSelectedTargetId}
                />
              )}
              {topPlayers[5] && (
                <Seat
                  label="P6"
                  player={topPlayers[5]}
                  isSelected={selectedTargetId === topPlayers[5].id}
                  isEnabled={canSelectTarget}
                  onSelect={setSelectedTargetId}
                />
              )}
            </div>
          </div>

          {bottomPlayers.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {bottomPlayers[0] && (
                <Seat
                  label="P7"
                  player={bottomPlayers[0]}
                  isSelected={selectedTargetId === bottomPlayers[0].id}
                  isEnabled={canSelectTarget}
                  onSelect={setSelectedTargetId}
                />
              )}
              {bottomPlayers[1] && (
                <Seat
                  label="P8"
                  player={bottomPlayers[1]}
                  isSelected={selectedTargetId === bottomPlayers[1].id}
                  isEnabled={canSelectTarget}
                  onSelect={setSelectedTargetId}
                />
              )}
              {bottomPlayers[2] && (
                <Seat
                  label="P9"
                  player={bottomPlayers[2]}
                  isSelected={selectedTargetId === bottomPlayers[2].id}
                  isEnabled={canSelectTarget}
                  onSelect={setSelectedTargetId}
                />
              )}
              {bottomPlayers[3] && (
                <Seat
                  label="P10"
                  player={bottomPlayers[3]}
                  isSelected={selectedTargetId === bottomPlayers[3].id}
                  isEnabled={canSelectTarget}
                  onSelect={setSelectedTargetId}
                />
              )}
              {bottomPlayers[4] && (
                <Seat
                  label="P11"
                  player={bottomPlayers[4]}
                  isSelected={selectedTargetId === bottomPlayers[4].id}
                  isEnabled={canSelectTarget}
                  onSelect={setSelectedTargetId}
                />
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/12 p-3 backdrop-blur-[2px]">
          <p className="mb-2 px-2 text-[11px] uppercase tracking-[0.25em] text-[#9CA3AF]">Chat Panel</p>
          <ChatBox
            messages={messages}
            werewolfMessages={[]}
            onSendMessage={handleSendMessage}
            currentRole={currentRole}
          />
        </div>
      </section>

    </div>
  );
}
