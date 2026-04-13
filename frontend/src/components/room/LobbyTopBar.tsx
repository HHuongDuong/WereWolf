import { useNavigate } from "react-router-dom";
import { useRoom } from "../../context/RoomContext";

interface Props {
  rightPanel: "settings" | "chat";
  lobbyOpen: boolean;
  onTogglePanel: () => void;
}

export function LobbyTopBar({ rightPanel, lobbyOpen, onTogglePanel }: Props) {
  const { players, room } = useRoom();
  const navigate = useNavigate();

  return (
    <div className="lobby-top-bar">
      {/* Left: logo */}
      <button className="ltb-logo" onClick={() => navigate("/")}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
        </svg>
        <span>Wolfy</span>
      </button>

      {/* Center: waiting status */}
      <div className="ltb-status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        <span>Waiting {players.length}/{room.maxPlayers}</span>
      </div>

      {/* Right: panel toggle + refresh */}
      <div className="ltb-actions">
        {lobbyOpen && (
          <button className="ltb-panel-btn" onClick={onTogglePanel}>
            {rightPanel === "chat" ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M9 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5" />
                  <path d="M16 19h6M19 16v6" />
                </svg>
                Game rules
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Messages
              </>
            )}
          </button>
        )}
        <button className="ltb-refresh-btn" onClick={() => window.location.reload()} title="Refresh">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15">
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
