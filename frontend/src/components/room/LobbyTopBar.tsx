import { useNavigate } from "react-router-dom";

export function LobbyTopBar() {
  const navigate = useNavigate();

  return (
    <div className="lobby-top-left">
      <a className="ltl-hub-link" onClick={() => navigate("/rooms")}>
        <div className="ltl-hub-icon">
          <img src="/img/icons/home.svg" alt="Hub" draggable={false} />
        </div>
        <span className="ltl-hub-name">Wolfy</span>
      </a>
    </div>
  );
}
