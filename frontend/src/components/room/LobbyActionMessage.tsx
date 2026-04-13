import { useState } from "react";
import { useRoom } from "../../context/RoomContext";

interface Props {
  lobbyOpen: boolean;
  onOpenLobby: () => void;
}

export function LobbyActionMessage({ lobbyOpen, onOpenLobby }: Props) {
  const { room } = useRoom();
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://wolfy.net/game/${room.id}`;

  function copyLink() {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!lobbyOpen) {
    return (
      <div className="lobby-action-msg">
        {/* Settings icon */}
        <div className="lam-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        </div>

        <h2 className="lam-title">Lobby settings</h2>
        <p className="lam-desc">
          Make your own game rules, then open the lobby by clicking the button below.
        </p>

        {/* Public / Private toggle */}
        <div className="lam-visibility">
          <button className="lam-vis-btn lam-vis-btn--active">Public</button>
          <button className="lam-vis-btn">Private</button>
        </div>

        <button className="lam-open-btn" onClick={onOpenLobby}>
          Open the lobby
        </button>
      </div>
    );
  }

  return (
    <div className="lobby-action-msg lobby-action-msg--waiting">
      {/* Waiting icon */}
      <div className="lam-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      </div>

      <h2 className="lam-title">Waiting for players</h2>
      <p className="lam-desc">
        You can share this game on social networks or with your friends.
      </p>

      <button
        className={`lam-invite-link ${copied ? "copied" : ""}`}
        onClick={copyLink}
        title="Copy invite link"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {copied ? "Copied!" : inviteLink}
      </button>
    </div>
  );
}
