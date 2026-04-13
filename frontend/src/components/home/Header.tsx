import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export function Header() {
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`header${scrolled ? " scrolled" : ""}`}>
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
            tabIndex={0}
            onBlur={() => setTimeout(() => setLangOpen(false), 150)}
          >
            <div className="lang-selector-inner">
              <img className="lang-icon" src="/img/icons/planet-earth.svg" alt="Location" />
              <img className="lang-arrow" src="/img/icons/arrow-down.svg" alt="" />
            </div>
            <div className={`lang-dropdown${langOpen ? " open" : ""}`}>
              <a href="/fr" className="lang-option">
                <span>Français</span>
              </a>
              <div className="lang-option active">
                <span>English</span>
                <img className="check-icon" src="/img/icons/check.svg" alt="Check" />
              </div>
            </div>
          </div>

          {user ? (
            <>
              <span className="nav-username">
                <img src="/img/icons/user.svg" alt="" />
                {user.username}
              </span>
              <a href="/rooms" className="btn-primary">
                <img src="/img/icons/play-button.svg" alt="Play" />
                <span>Play</span>
              </a>
              <button className="btn-secondary" onClick={logout}>
                <img src="/img/icons/user.svg" alt="" />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <>
              <a href="/auth/login" className="btn-secondary">
                <img src="/img/icons/user.svg" alt="" />
                <span>Log in</span>
              </a>
              <a href="/auth/register" className="btn-primary">
                <img src="/img/icons/play-button.svg" alt="Play werewolf" />
                <span>Play</span>
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
