export function AppDownload() {
  return (
    <section className="app-download">
      <div className="app-download-inner">
        {/* Phone mockup */}
        <div className="app-mockup">
          <img
            src="/img/assets/mockup-phone.png"
            alt="Mockup"
            className="app-mockup-phone"
          />
        </div>

        {/* Text + download buttons */}
        <div className="app-description">
          <h2>Wolfy is available on phone</h2>
          <p>
            The Wolfy experience is available on iOS and Android devices.
            Check out our app without further ado.
          </p>
          <div className="app-buttons">
            <a
              href="https://apps.apple.com/app/wolfy/id1489243120"
              target="_blank"
              rel="noopener"
              className="app-btn"
            >
              <img src="/img/assets/download-appstore.svg" alt="Download on the Apple Store" />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=fr.wolfy.app"
              target="_blank"
              rel="noopener"
              className="app-btn"
            >
              <img src="/img/assets/download-play.svg" alt="Download on Google Play" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
