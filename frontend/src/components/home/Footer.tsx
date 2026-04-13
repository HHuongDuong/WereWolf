export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <img src="/img/assets/logo_background.svg" alt="Wolfy logo" />
          <h1 className="footer-name">Wolfy</h1>
        </div>

        <div className="footer-menu-section">
          <div className="footer-menu">
            <div className="footer-item">
              <a href="https://help.wolfy.net/en/" target="_blank" rel="noopener">Help center</a>
            </div>
            <div className="footer-item">
              <a href="/cgu">Terms &amp; Legal Notice</a>
            </div>
            <div className="footer-item">
              <a href="/press">Press</a>
            </div>
          </div>

          <div className="footer-menu last">
            <div className="footer-item">
              <a href="https://twitter.com/playwolfy" target="_blank" rel="noopener">Twitter</a>
            </div>
            <div className="footer-item">
              <a href="https://wolfy.fr/instagram" target="_blank" rel="noopener">Instagram</a>
            </div>
            <div className="footer-item">
              <a href="https://wolfy.fr/discord" target="_blank" rel="noopener">Discord</a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © Wolfy 2018-{year} — All rights reserved.
      </div>
    </footer>
  );
}
