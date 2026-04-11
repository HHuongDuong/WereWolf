export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/img/assets/logo.svg" alt="Wolfy" className="footer-logo" />
          <span className="footer-name">Wolfy</span>
        </div>

        <nav className="footer-links">
          <a href="https://help.wolfy.net/en/" target="_blank" rel="noopener">
            Help center
          </a>
          <a href="/cgu" target="_blank">
            Terms &amp; Legal Notice
          </a>
          <a href="/press" target="_blank">
            Press
          </a>
          <a href="https://twitter.com/playwolfy" target="_blank" rel="noopener">
            Twitter
          </a>
          <a href="https://wolfy.fr/instagram" target="_blank" rel="noopener">
            Instagram
          </a>
          <a href="https://wolfy.fr/discord" target="_blank" rel="noopener">
            Discord
          </a>
        </nav>

        <p className="footer-copy">
          © Wolfy 2018-{year} — All rights reserved
        </p>
      </div>
    </footer>
  );
}
