import { useState } from "react";
import { useRoom } from "../../context/RoomContext";
import { useGameStore } from "../../stores/gameStore";
import { useGuest } from "../../context/AuthContext";

interface Props {
  lobbyOpen: boolean;
  onOpenLobby: () => void;
}

export function LobbyActionMessage({ lobbyOpen, onOpenLobby }: Props) {
  const { room, players } = useRoom();
  const { guest } = useGuest();
  const { setPhase, setMyRole, setPlayers: setGamePlayers, nextRound } = useGameStore();
  const [copied, setCopied] = useState(false);

  function devForceStart() {
    const gamePlayers = players.length > 0
      ? players.map(p => ({ guestId: p.guestId, displayName: p.displayName, isAlive: true }))
      : [{ guestId: guest.guestId, displayName: guest.displayName, isAlive: true }];
    setGamePlayers(gamePlayers);
    setMyRole("Werewolf");
    setPhase("role_reveal");
    setTimeout(() => { nextRound(); setPhase("night"); }, 5000);
  }

  const inviteLink = `https://wolfy.net/game/${room.id}`;

  function copyLink() {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!lobbyOpen) {
    return (
      <div className="lobby-action-msg">
        {/* Book / settings icon */}
        <div className="lam-icon">
          <img src="/img/icons/book.svg" alt="" draggable={false} />
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

        {import.meta.env.DEV && (
          <button className="dev-skip-btn" style={{ marginTop: 12, width: "100%" }} onClick={devForceStart}>
            DEV: Force Start Game
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="lobby-action-msg lobby-action-msg--waiting">
      {/* Waiting / time icon */}
      <div className="lam-icon">
        <img src="/img/icons/time.svg" alt="" draggable={false} />
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

      {import.meta.env.DEV && (
        <button className="dev-skip-btn" style={{ marginTop: 12, width: "100%" }} onClick={devForceStart}>
          DEV: Force Start Game
        </button>
      )}
    </div>
  );
}
