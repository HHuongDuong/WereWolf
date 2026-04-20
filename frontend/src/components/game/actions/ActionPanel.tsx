"use client";

import { Role, Player, GamePhase } from "@/shared/types/game";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";

import { WolfTargetSelector } from "./WolfTargetSelector";
import { SeerInspectPanel } from "./SeerInspectPanel";
import { GuardProtectSelector } from "./GuardProtectSelector";
import { WitchSaveButton } from "./WitchSaveButton";
import { WitchPoisonButton } from "./WitchPoisonButton";
import { PotionStatus } from "./PotionStatus";

interface ActionPanelProps {
  myRole: Role;
  phase: GamePhase;
  players: Player[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onAction: (action: string, targetId?: string) => void;
  potionStatus?: { saveUsed: boolean; poisonUsed: boolean };
  hasActed?: boolean;
}

export function ActionPanel({
  myRole,
  phase,
  players,
  selectedId,
  onSelect,
  onAction,
  potionStatus,
  hasActed = false,
}: ActionPanelProps) {
  if (phase !== GamePhase.NIGHT) return null;

  return (
    <Card className="mt-10">
      <div className="text-center mb-8">
        <Typography variant="secondary">YOUR NIGHT ACTION</Typography>
        <h3 className="text-3xl font-bold mt-2 tracking-wide">
          {myRole === Role.WEREWOLF ? "Hunt Together" :
            myRole === Role.SEER ? "Divine Insight" :
              myRole === Role.WITCH ? "Brew Your Potions" :
                myRole === Role.GUARD ? "Stand Vigil" : "Act"}
        </h3>
      </div>

      {myRole === Role.WEREWOLF && (
        <WolfTargetSelector
          players={players}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )}

      {myRole === Role.SEER && (
        <SeerInspectPanel
          players={players}
          selectedId={selectedId}
          onSelect={onSelect}
          onInspect={() => onAction("inspect", selectedId)}
          hasInspected={hasActed}
        />
      )}

      {myRole === Role.GUARD && (
        <GuardProtectSelector
          players={players}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )}

      {myRole === Role.WITCH && potionStatus && (
        <div className="space-y-8">
          <PotionStatus saveUsed={potionStatus.saveUsed} poisonUsed={potionStatus.poisonUsed} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WitchSaveButton
              onSave={() => onAction("save")}
              disabled={hasActed}
              used={potionStatus.saveUsed}
            />
            <WitchPoisonButton
              onPoison={() => onAction("poison", selectedId)}
              disabled={hasActed || !selectedId}
              used={potionStatus.poisonUsed}
            />
          </div>
        </div>
      )}

      {(myRole === Role.WEREWOLF || myRole === Role.GUARD) && selectedId && !hasActed && (
        <button
          onClick={() => onAction(myRole === Role.WEREWOLF ? "kill" : "protect", selectedId)}
          className="mt-8 w-full py-4 bg-[#7C3AED] hover:bg-[#6D28D9] rounded-2xl font-bold tracking-widest transition-all"
        >
          CONFIRM ACTION
        </button>
      )}
    </Card>
  );
}
