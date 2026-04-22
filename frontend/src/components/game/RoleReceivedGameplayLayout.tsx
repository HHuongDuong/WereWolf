"use client";

import { useEffect, useMemo, useState } from "react";
import { ChatBox } from "@/components/game/chat/ChatBox";
import { Avatar } from "@/components/ui/Avatar";
import { GamePhase, Player, Role } from "@/shared/types/game";
import { Message } from "@/components/game/chat/types";
import { roleCardFrontImageByRole } from "@/shared/lib/roleCardAssets";
import { ActionResultToast } from "@/components/game/actions/ActionResultToast";
import { getRoomGatewaySocket } from "@/shared/network/roomGatewaySocket";
import { useGameStore, WitchPotionsState } from "@/entities/game/model/gameStore";
import { RoomConfig } from "@/shared/types/lobby";

interface RoleReceivedGameplayLayoutProps {
  players: Player[];
  playerName: string;
  currentRole: Role;
  phase: GamePhase;
  day: number;
  deadlineTimestamp: number | null;
  hasActed: boolean;
  roomId: string | null;
  witchPotions: WitchPotionsState;
  hunterTriggered: boolean;
  currentNightRole: Role | null;
  roomConfig?: RoomConfig;
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
      role === Role.GUARD
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
        "group relative mx-auto aspect-square w-full max-w-[136px] rounded-lg border backdrop-blur-sm p-2 text-left transition-all duration-300",
        isSelected
          ? "border-red-900 shadow-[0_0_15px_rgba(153,27,27,0.6),inset_0_0_20px_rgba(153,27,27,0.2)] bg-black/60"
          : "border-slate-800 bg-black/40",
        isEnabled ? "hover:border-red-800/80 hover:shadow-[0_0_10px_rgba(153,27,27,0.4)] hover:bg-black/50" : "cursor-not-allowed opacity-40 grayscale",
      ].join(" ")}
    >
      <div className="mt-2 flex h-[calc(100%-1rem)] flex-col items-center justify-center gap-1.5 text-center">
        <div className={isSelected ? "drop-shadow-[0_0_8px_rgba(153,27,27,0.8)] transition-all" : "transition-all group-hover:drop-shadow-[0_0_5px_rgba(153,27,27,0.5)]"}>
          <Avatar name={player.name} isDead={!player.isAlive} size="sm" shape="circle" />
        </div>
        <p className="line-clamp-2 text-xs font-serif font-medium text-slate-300 group-hover:text-white transition-colors">{player.name}</p>
      </div>

      {isSelected && (
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_center,rgba(153,27,27,0.25),transparent_70%)]" />
      )}
      {isEnabled && !isSelected && (
        <div className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(153,27,27,0.15),transparent_70%)]" />
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
  roomId,
  witchPotions,
  hunterTriggered,
  currentNightRole,
  roomConfig,
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
  const myTurn =
    phase === GamePhase.NIGHT
      ? currentNightRole === currentRole
      : isRoleTurn(currentRole, phase);
  const canAct =
    currentRole === Role.HUNTER ? hunterTriggered && !hasActed : myTurn && !hasActed;
  const roleActions = getRoleActions(currentRole);
  const isAbilityRole = roleHasAbility(currentRole);
  const canSelectTarget =
    canAct &&
    isAbilityRole &&
    roleActions.some((a) => a.requiresTarget) &&
    !(currentRole === Role.WITCH && witchPotions.poisonUsed);
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
      if (phase === GamePhase.NIGHT && currentNightRole && roomConfig) {
        const durationSec =
          currentNightRole === Role.GUARD
            ? roomConfig.guardDuration ?? 30
            : currentNightRole === Role.SEER
              ? roomConfig.seerDuration ?? 30
              : currentNightRole === Role.WEREWOLF
                ? roomConfig.werewolfDuration ?? 45
                : currentNightRole === Role.WITCH
                  ? roomConfig.witchDuration ?? 30
                  : 30;
        setSecondsLeft(durationSec);
      } else {
        setSecondsLeft(null);
      }
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
    if (secondsLeft !== 0) return;
    if (!canAct) return;
    // Skip action locally when timer hits 0 (server will advance by its own timeout).
    useGameStore.getState().setHasActed(true);
    setSelectedTargetId(null);
    setToast({ isVisible: true, type: "info", message: "Time's up — skipped." });
  }, [canAct, secondsLeft]);

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

    if (currentRole === Role.WITCH) {
      if (action.key === "heal" && witchPotions.healUsed) {
        setToast({ isVisible: true, type: "info", message: "Heal potion already used." });
        return;
      }
      if (action.key === "poison" && witchPotions.poisonUsed) {
        setToast({ isVisible: true, type: "info", message: "Poison potion already used." });
        return;
      }
    }
    if (currentRole === Role.HUNTER && !hunterTriggered) {
      setToast({ isVisible: true, type: "info", message: "Hunter can shoot only when triggered by death." });
      return;
    }
    if (action.requiresTarget && !selectedTargetId) {
      setToast({ isVisible: true, type: "error", message: "Select a target first." });
      return;
    }

    if (!roomId) {
      setToast({ isVisible: true, type: "error", message: "Missing roomId." });
      return;
    }

    const socket = getRoomGatewaySocket();
    const { actionType, targetId } = mapUiActionToNightAction(currentRole, action.key, selectedTargetId);
    if (!actionType) {
      setToast({ isVisible: true, type: "info", message: "Action not supported by gateway yet." });
      return;
    }

    useGameStore.getState().setLastNightActionKey(action.key);
    socket.send("night_action", {
      roomId,
      actionType,
      ...(targetId === undefined ? {} : { targetId }),
    });

    const targetName = selectedTarget?.name;
    const suffix = action.requiresTarget && targetName ? ` → ${targetName}` : "";
    setToast({ isVisible: true, type: "success", message: `Sent: ${action.label}${suffix}` });
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
    <div className="-mt-8 space-y-6">
      <ActionResultToast
        isVisible={toast.isVisible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-black/50 px-5 py-4 text-center shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(153,27,27,0.05),transparent)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-[0.3em] font-serif text-slate-400">Day {day}</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] font-serif text-slate-400">Phase State</p>
            <p className="mt-1 text-xl font-serif font-semibold tracking-wide text-red-50 drop-shadow-[0_0_8px_rgba(153,27,27,0.8)]">{phase}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.3em] font-serif text-slate-400">Time Remaining</p>
            <p className="mt-1 font-mono text-2xl font-bold text-red-400 drop-shadow-[0_0_5px_rgba(153,27,27,0.5)]">
              {secondsLeft === null ? "--:--" : `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_450px]">
        <div className="rounded-2xl border border-slate-800 bg-black/40 p-5 shadow-[0_0_30px_rgba(0,0,0,0.9)] backdrop-blur-sm">
          <div className="grid gap-5 lg:grid-cols-[0.72fr_1.56fr_0.72fr]">
            <div className="grid grid-cols-1 gap-4">
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

            <div className="space-y-5">
              <div className="relative rounded-xl border border-slate-800 bg-black/60 p-5 text-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_center,rgba(153,27,27,0.05),transparent_70%)]" />
                <p className="relative text-[11px] uppercase tracking-[0.2em] font-serif text-red-400/80">Identity</p>
                <div className="relative mt-4 flex items-center justify-center">
                  <div className="relative w-52 overflow-visible rounded-lg border-2 border-slate-700/50 shadow-[0_15px_35px_rgba(0,0,0,0.7),0_0_20px_rgba(153,27,27,0.2)] transition-transform hover:scale-105 duration-500">
                    <img
                      src={roleCardFrontImageByRole[currentRole]}
                      alt={`${currentRole} role card`}
                      decoding="sync"
                      className="h-auto w-full object-cover rounded-md"
                    />
                    <div className="absolute -bottom-4 -right-4 rounded-full border border-slate-700 bg-black p-1 shadow-[0_0_15px_rgba(153,27,27,0.5)]">
                      <Avatar name={playerName} size="sm" shape="circle" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-xl border border-slate-800 bg-black/60 p-5 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.2em] font-serif text-red-400/80">Grimoire</p>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded border ${canAct ? "border-green-900/50 text-green-400 bg-green-950/30" : hasActed ? "border-slate-700 text-slate-400 bg-slate-900/50" : "border-amber-900/50 text-amber-500 bg-amber-950/30"}`}>
                    {canAct ? "Your turn" : hasActed ? "Acted" : "Wait turn"}
                  </span>
                </div>
                <p className="mt-3 font-serif text-lg text-slate-200">{actionLabel}</p>
                {canSelectTarget && (
                  <p className="mt-1 text-xs font-serif text-slate-400">
                    Targeting:{" "}
                    <span className="font-semibold text-red-400 drop-shadow-[0_0_5px_rgba(153,27,27,0.3)]">
                      {selectedTarget ? selectedTarget.name : "None"}
                    </span>
                  </p>
                )}
                <div className="mt-4 space-y-2.5">
                  {roleActions.map((action) => (
                    <button
                      key={action.key}
                      type="button"
                      onClick={() => performAction(action)}
                      disabled={
                        !canAct ||
                        !isAbilityRole ||
                        (action.requiresTarget && !selectedTargetId) ||
                        (currentRole === Role.WITCH && action.key === "heal" && witchPotions.healUsed) ||
                        (currentRole === Role.WITCH && action.key === "poison" && witchPotions.poisonUsed) ||
                        (currentRole === Role.HUNTER && !hunterTriggered)
                      }
                      className="group relative w-full overflow-hidden rounded-lg border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 px-4 py-3 text-left font-serif text-sm text-slate-300 transition-all duration-300 enabled:hover:border-red-800 enabled:hover:text-red-100 enabled:hover:shadow-[0_0_15px_rgba(153,27,27,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="relative z-10 uppercase tracking-widest">{action.label}</span>
                      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,transparent,rgba(153,27,27,0.1),transparent)] translate-x-[-100%] transition-transform duration-500 group-hover:translate-x-[100%]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
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
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
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

        <div className="rounded-2xl border border-slate-800 bg-black/40 p-4 shadow-[0_0_30px_rgba(0,0,0,0.9)] backdrop-blur-sm flex flex-col">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            <p className="text-[11px] uppercase tracking-[0.25em] font-serif text-slate-400">Whispers</p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          </div>
          <div className="flex-1 min-h-[300px]">
            <ChatBox
              messages={messages}
              werewolfMessages={[]}
              onSendMessage={handleSendMessage}
              currentRole={currentRole}
            />
          </div>
        </div>
      </section>

    </div>
  );
}

function mapUiActionToNightAction(
  role: Role,
  actionKey: string,
  selectedTargetId: string | null,
): { actionType: string | null; targetId?: string } {
  if (role === Role.WEREWOLF && actionKey === "devour") {
    return { actionType: "werewolf_kill", targetId: selectedTargetId ?? undefined };
  }
  if (role === Role.SEER && actionKey === "prophesy") {
    return { actionType: "seer", targetId: selectedTargetId ?? undefined };
  }
  if (role === Role.GUARD && actionKey === "protect") {
    return { actionType: "guard", targetId: selectedTargetId ?? undefined };
  }
  if (role === Role.WITCH && actionKey === "poison") {
    return { actionType: "witch", targetId: selectedTargetId ?? undefined };
  }
  if (role === Role.WITCH && actionKey === "heal") {
    return { actionType: "witch" };
  }
  if (role === Role.HUNTER && actionKey === "shoot") {
    return { actionType: "hunter", targetId: selectedTargetId ?? undefined };
  }
  return { actionType: null };
}
