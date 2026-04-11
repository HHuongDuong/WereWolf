import { useParams } from "react-router-dom";
import { RoomProvider } from "../context/RoomContext";
import { RoomHeader } from "../components/room/RoomHeader";
import { PlayersPanel } from "../components/room/PlayersPanel";
import { GameSettings } from "../components/room/GameSettings";
import { LobbyChat } from "../components/room/LobbyChat";
import { GameView } from "../components/game/GameView";
import { useGameStore } from "../stores/gameStore";

export function RoomPage() {
  const { id = "unknown" } = useParams();
  const phase = useGameStore(s => s.phase);

  return (
    <RoomProvider roomId={id}>
      {phase === "lobby" ? (
        <div className="room-page">
          <RoomHeader />
          <div className="room-page-body">
            <PlayersPanel />
            <div className="room-right-panel">
              <GameSettings />
              <LobbyChat />
            </div>
          </div>
        </div>
      ) : (
        <GameView />
      )}
    </RoomProvider>
  );
}
