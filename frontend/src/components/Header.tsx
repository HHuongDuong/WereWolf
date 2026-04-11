import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const [langOpen, setLangOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-left">
          <a href="/" className="brand">
            <img src="/img/assets/logo.svg" alt="Wolfy logo" className="brand-logo" />
            <span className="brand-name">Wolfy</span>
          </a>
          <a href="https://wolfy.fr/instagram" target="_blank" rel="noopener" className="nav-link">
            Join Instagram
          </a>
          <a href="https://help.wolfy.net/en/" target="_blank" rel="noopener" className="nav-link">
            Help center
          </a>
        </div>

        <div className="nav-right">
          <div
            className="lang-selector"
            onClick={() => setLangOpen(o => !o)}
            onBlur={() => setLangOpen(false)}
            tabIndex={0}
          >
            <img src="/img/icons/planet-earth.svg" alt="Language" className="lang-icon" />
            <span>EN</span>
            <img src="/img/icons/arrow-down.svg" alt="" className="lang-arrow" />
            {langOpen && (
              <div className="lang-dropdown">
                <a href="/fr" className="lang-option">
                  <span>Français</span>
                </a>
                <div className="lang-option active">
                  <span>English</span>
                  <img src="/img/icons/check.svg" alt="selected" className="check-icon" />
                </div>
              </div>
            )}
          </div>

          {user ? (
            <>
              <span className="nav-username">
                <img src="/img/icons/user.svg" alt="" />
                {user.username}
              </span>
              <a href="/rooms" className="btn-primary">
                <img src="/img/icons/play-button.svg" alt="" />
                <span>Play</span>
              </a>
              <button className="btn-secondary" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <a href="/auth/login" className="btn-secondary">
                <img src="/img/icons/user.svg" alt="" />
                <span>Log in</span>
              </a>
              <a href="/auth/register" className="btn-primary">
                <img src="/img/icons/play-button.svg" alt="" />
                <span>Play</span>
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
