"use client";

import { useEffect, useMemo, useState } from "react";
import { ChatBox } from "@/components/game/chat/ChatBox";
import { Avatar } from "@/components/ui/Avatar";
import { GamePhase, Player, Role } from "@/shared/types/game";
import { Message } from "@/components/game/chat/types";
import { backCardImage, roleCardFrontImageByRole } from "@/shared/lib/roleCardAssets";
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
  isAlive: boolean;
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

function getPanelActions(role: Role, phase: GamePhase): RoleAction[] {
  if (phase === GamePhase.VOTING) {
    return [{ key: "vote", label: "Vote", requiresTarget: true }];
  }
  return getRoleActions(role);
}

function Seat({
  label,
  player,
  isSelected,
  isEnabled,
  onSelect,
  revealedRole,
}: {
  label: string;
  player: Player;
  isSelected: boolean;
  isEnabled: boolean;
  onSelect: (playerId: string) => void;
  revealedRole?: Role | null;
}) {
  const cardImage = revealedRole ? roleCardFrontImageByRole[revealedRole] : backCardImage;

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
        <div className="relative w-16">
          <img
            src={cardImage}
            alt={revealedRole ? `${revealedRole} card` : "Hidden role card"}
            className="w-full rounded-md border border-slate-700"
          />
          {!player.isAlive && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md">
              <img src="/images/overlay/claw_mark.png" alt="Dead" className="w-full h-full object-contain opacity-40" />
            </div>
          )}
        </div>
        <div className={isSelected ? "drop-shadow-[0_0_8px_rgba(153,27,27,0.8)] transition-all" : "transition-all group-hover:drop-shadow-[0_0_5px_rgba(153,27,27,0.5)]"}>
          <Avatar name={player.name} isDead={!player.isAlive} size="sm" shape="circle" />
        </div>
        <div className="mt-1 w-full bg-black/60 py-1 px-1 rounded border border-slate-700/50">
          <p className="line-clamp-1 text-[11px] md:text-xs font-accent tracking-widest uppercase text-amber-500/90 group-hover:text-amber-400 transition-colors drop-shadow-md">
            {player.name}
          </p>
        </div>
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
  isAlive,
  witchPotions,
  hunterTriggered,
  currentNightRole,
  roomConfig,
}: RoleReceivedGameplayLayoutProps) {
  const seerReveal = useGameStore((state) => state.seerReveal);
  const fellowWolves = useGameStore((state) => state.fellowWolves);
  const previousPhase = useGameStore((state) => state.previousPhase);
  const lastPhaseDeadIds = useGameStore((state) => state.lastPhaseDeadIds);
  const lastPhaseEliminatedId = useGameStore((state) => state.lastPhaseEliminatedId);
  const [lastAnnouncedPhase, setLastAnnouncedPhase] = useState<GamePhase | null>(null);
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
    phase === GamePhase.VOTING
      ? isAlive && !hasActed
      : currentRole === Role.HUNTER
        ? hunterTriggered && !hasActed
        : isAlive && myTurn && !hasActed;
  const roleActions = getPanelActions(currentRole, phase);
  const isAbilityRole = roleHasAbility(currentRole);
  const canSelectTarget =
    canAct &&
    (phase === GamePhase.VOTING || isAbilityRole) &&
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
  }, [deadlineTimestamp, phase, currentNightRole, roomConfig]);

  useEffect(() => {
    if (phase === lastAnnouncedPhase) return;

    if (phase === GamePhase.DAY && previousPhase === GamePhase.NIGHT) {
      if (lastPhaseDeadIds.length > 0) {
        const deadNames = lastPhaseDeadIds.map(id => players.find(p => p.id === id)?.name || "Unknown").join(", ");
        setMessages(prev => [...prev, {
          id: `sys-death-${Date.now()}`,
          type: "system",
          subtype: "important",
          content: `The village awakens to tragedy. ${deadNames} ${lastPhaseDeadIds.length > 1 ? "were" : "was"} found dead.`,
          timestamp: new Date().toISOString(),
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `sys-peace-${Date.now()}`,
          type: "system",
          subtype: "normal",
          content: "The village awakens peacefully. No one was killed in the night.",
          timestamp: new Date().toISOString(),
        }]);
      }
    } else if (phase === GamePhase.NIGHT && previousPhase === GamePhase.VOTING) {
      if (lastPhaseEliminatedId) {
        const eliminatedName = players.find(p => p.id === lastPhaseEliminatedId)?.name || "Unknown";
        setMessages(prev => [...prev, {
          id: `sys-vote-${Date.now()}`,
          type: "system",
          subtype: "important",
          content: `The village has spoken. ${eliminatedName} was voted out and eliminated.`,
          timestamp: new Date().toISOString(),
        }]);
      } else if (lastPhaseDeadIds.length > 0 && lastPhaseDeadIds.length !== 1 && lastPhaseDeadIds[0] !== lastPhaseEliminatedId) {
        const deadNames = lastPhaseDeadIds.map(id => players.find(p => p.id === id)?.name || "Unknown").join(", ");
        setMessages(prev => [...prev, {
          id: `sys-vote-death-${Date.now()}`,
          type: "system",
          subtype: "important",
          content: `The village has spoken, but tragedy strikes. ${deadNames} ${lastPhaseDeadIds.length > 1 ? "were" : "was"} found dead.`,
          timestamp: new Date().toISOString(),
        }]);
      } else if (!lastPhaseEliminatedId) {
        setMessages(prev => [...prev, {
          id: `sys-vote-skip-${Date.now()}`,
          type: "system",
          subtype: "normal",
          content: `The village has spoken. No one was voted out.`,
          timestamp: new Date().toISOString(),
        }]);
      }
    }
    setLastAnnouncedPhase(phase);
  }, [phase, previousPhase, lastPhaseDeadIds, lastPhaseEliminatedId, players, lastAnnouncedPhase]);

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
    if (phase !== GamePhase.VOTING && !isAbilityRole) {
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
    if (phase === GamePhase.VOTING) {
      if (!selectedTargetId) {
        setToast({ isVisible: true, type: "error", message: "Select a target to vote." });
        return;
      }
      socket.send("vote", {
        roomId,
        round: day,
        targetId: selectedTargetId,
      });
      useGameStore.getState().setLastNightActionKey("vote");
      const targetName = selectedTarget?.name;
      setToast({ isVisible: true, type: "info", message: `Submitting vote${targetName ? ` -> ${targetName}` : ""}...` });
      return;
    }

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
    if (!isAlive) {
      setToast({ isVisible: true, type: "info", message: "You are dead and cannot chat." });
      return;
    }
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

  const getSeatProps = (player: Player) => {
    const isFellowWolf = currentRole === Role.WEREWOLF && fellowWolves.includes(player.id);
    const revealedRole = seerReveal?.targetId === player.id
      ? seerReveal.revealedRole
      : isFellowWolf
        ? Role.WEREWOLF
        : null;
    const isWolfTargetingWolfInNight = phase === GamePhase.NIGHT && isFellowWolf;
    const isEnabled = canSelectTarget && !isWolfTargetingWolfInNight;

    return {
      isSelected: selectedTargetId === player.id,
      isEnabled,
      onSelect: setSelectedTargetId,
      revealedRole,
    };
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
            <p className="mt-1 text-xs font-serif text-slate-400">
              Current turn:{" "}
              <span className="font-semibold text-red-300">
                {phase === GamePhase.NIGHT
                  ? currentNightRole ?? "RESOLVING"
                  : phase === GamePhase.VOTING
                    ? "ALL (VOTE)"
                    : "DISCUSS"}
              </span>
            </p>
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
                  {...getSeatProps(topPlayers[0])}
                />
              )}
              {topPlayers[1] && (
                <Seat
                  label="P2"
                  player={topPlayers[1]}
                  {...getSeatProps(topPlayers[1])}
                />
              )}
              {topPlayers[2] && (
                <Seat
                  label="P3"
                  player={topPlayers[2]}
                  {...getSeatProps(topPlayers[2])}
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
                      <Avatar name={playerName} isDead={!isAlive} size="sm" shape="circle" />
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
                        (phase !== GamePhase.VOTING && !isAbilityRole) ||
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
                  {...getSeatProps(topPlayers[3])}
                />
              )}
              {topPlayers[4] && (
                <Seat
                  label="P5"
                  player={topPlayers[4]}
                  {...getSeatProps(topPlayers[4])}
                />
              )}
              {topPlayers[5] && (
                <Seat
                  label="P6"
                  player={topPlayers[5]}
                  {...getSeatProps(topPlayers[5])}
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
                  {...getSeatProps(bottomPlayers[0])}
                />
              )}
              {bottomPlayers[1] && (
                <Seat
                  label="P8"
                  player={bottomPlayers[1]}
                  {...getSeatProps(bottomPlayers[1])}
                />
              )}
              {bottomPlayers[2] && (
                <Seat
                  label="P9"
                  player={bottomPlayers[2]}
                  {...getSeatProps(bottomPlayers[2])}
                />
              )}
              {bottomPlayers[3] && (
                <Seat
                  label="P10"
                  player={bottomPlayers[3]}
                  {...getSeatProps(bottomPlayers[3])}
                />
              )}
              {bottomPlayers[4] && (
                <Seat
                  label="P11"
                  player={bottomPlayers[4]}
                  {...getSeatProps(bottomPlayers[4])}
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
              inputDisabled={!isAlive}
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
