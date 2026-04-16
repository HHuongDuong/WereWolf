import { useNavigate } from "react-router-dom";
import { useRoom } from "../../context/RoomContext";

export function LobbyTopBar() {
  const navigate = useNavigate();
  const { leaveRoom } = useRoom();

  return (
    <div className="lobby-top-left">
      <a className="ltl-hub-link" onClick={() => navigate("/rooms")}>
        <div className="ltl-hub-icon">
          <img src="/img/icons/home.svg" alt="Hub" draggable={false} />
        </div>
        <span className="ltl-hub-name">Wolfy</span>
      </a>
      <button className="ltl-leave-btn" onClick={leaveRoom}>
        Leave
      </button>
    </div>
  );
}
