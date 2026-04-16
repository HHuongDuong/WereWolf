import { useState } from "react";
import { useParams } from "react-router-dom";
import { RoomProvider } from "../context/RoomContext";
import { CampScene } from "../components/room/CampScene";
import { CharacterRing } from "../components/room/CharacterRing";
import { LobbyTopBar } from "../components/room/LobbyTopBar";
import { LobbyActionMessage } from "../components/room/LobbyActionMessage";
import { LobbySettingsPanel } from "../components/room/LobbySettingsPanel";
import { LobbyChatPanel } from "../components/room/LobbyChatPanel";
import { GameView } from "../components/game/GameView";
import { useGameStore } from "../stores/gameStore";

function LobbyScene() {
  const [lobbyOpen, setLobbyOpen] = useState(false);
  const [rightPanel, setRightPanel] = useState<"settings" | "chat">("settings");

  function handleOpenLobby() {
    setLobbyOpen(true);
    setRightPanel("chat");
  }

  function handleTogglePanel() {
    setRightPanel(p => (p === "chat" ? "settings" : "chat"));
  }

  return (
    <div className="lobby-scene">
      {/* z:0 — full-viewport background */}
      <CampScene />

      {/* z:20 — floating hub pill top-left */}
      <LobbyTopBar />

      {/* z:5 — character slots on the ground */}
      <CharacterRing />

      {/* z:5 — floating card in the left scene area */}
      <LobbyActionMessage lobbyOpen={lobbyOpen} onOpenLobby={handleOpenLobby} />

      {/* z:10 — right panel, overlaid on scene */}
      {rightPanel === "settings"
        ? <LobbySettingsPanel lobbyOpen={lobbyOpen} rightPanel={rightPanel} onTogglePanel={handleTogglePanel} />
        : <LobbyChatPanel     lobbyOpen={lobbyOpen} rightPanel={rightPanel} onTogglePanel={handleTogglePanel} />
      }
    </div>
  );
}

export function RoomPage() {
  const { id: roomCode = "unknown" } = useParams();
  const phase = useGameStore(s => s.phase);

  return (
    <RoomProvider roomCode={roomCode}>
      {phase === "lobby" ? <LobbyScene /> : <GameView />}
    </RoomProvider>
  );
}
