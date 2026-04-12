import { useParams } from "react-router-dom";
import { RoomProvider } from "../context/RoomContext";
import { CampScene } from "../components/room/CampScene";
import { CharacterRing } from "../components/room/CharacterRing";
import { LobbyActionMessage } from "../components/room/LobbyActionMessage";
import { LobbyChatPanel } from "../components/room/LobbyChatPanel";
import { GameView } from "../components/game/GameView";
import { useGameStore } from "../stores/gameStore";

export function RoomPage() {
  const { id = "unknown" } = useParams();
  const phase = useGameStore(s => s.phase);

  return (
    <RoomProvider roomId={id}>
      {phase === "lobby" ? (
        <div className="lobby-scene">
          <CampScene />
          <CharacterRing />
          <LobbyActionMessage />
          <LobbyChatPanel />
        </div>
      ) : (
        <GameView />
      )}
    </RoomProvider>
  );
}
