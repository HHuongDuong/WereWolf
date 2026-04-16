import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
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

  const inviteLink = `${window.location.origin}/rooms/${room.code}`;

  function copyLink() {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!lobbyOpen) {
    return (
      <div className="lobby-action-msg">
        {/* Left: icon + QR placeholder */}
        <div className="lam-left">
          <div className="lam-icon">
            <img src="/img/icons/book.svg" alt="" draggable={false} />
          </div>
        </div>

        {/* Right: text + controls */}
        <div className="lam-right">
          <h2 className="lam-title">Lobby settings</h2>
          <p className="lam-desc">
            Make your own game rules, then open the lobby.
          </p>

          <div className="lam-visibility">
            <button className="lam-vis-btn lam-vis-btn--active">Public</button>
            <button className="lam-vis-btn">Private</button>
          </div>

          <button className="lam-open-btn" onClick={onOpenLobby}>
            Open the lobby
          </button>

          {import.meta.env.DEV && (
            <button className="dev-skip-btn" style={{ marginTop: 10, width: "100%" }} onClick={devForceStart}>
              DEV: Force Start Game
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-action-msg lobby-action-msg--waiting">
      {/* Left: QR code */}
      <div className="lam-left">
        <div className="lam-qr">
          <QRCodeSVG
            value={inviteLink}
            size={96}
            bgColor="transparent"
            fgColor="#ffffff"
            level="M"
          />
        </div>
      </div>

      {/* Right: text + invite link */}
      <div className="lam-right">
        <h2 className="lam-title">Waiting for players</h2>
        <p className="lam-desc">
          Share the link or scan the QR code.
        </p>

        <button
          className={`lam-invite-link ${copied ? "copied" : ""}`}
          onClick={copyLink}
          title="Copy invite link"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ flexShrink: 0 }}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>{copied ? "Copied!" : inviteLink}</span>
        </button>

        {import.meta.env.DEV && (
          <button className="dev-skip-btn" style={{ marginTop: 10, width: "100%" }} onClick={devForceStart}>
            DEV: Force Start Game
          </button>
        )}
      </div>
    </div>
  );
}
