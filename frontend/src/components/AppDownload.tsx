export function AppDownload() {
  return (
    <section className="app-download">
      <div className="app-download-inner">
        <h2>Wolfy is available on phone</h2>
        <p>
          The Wolfy experience is available on iOS and Android devices.
          Play anytime, anywhere — the village never sleeps.
        </p>

        <div className="app-buttons">
          <a
            href="https://apps.apple.com/app/wolfy/id1476288990"
            target="_blank"
            rel="noopener"
            className="app-btn"
          >
            <img src="/img/assets/download-appstore.svg" alt="Download on the App Store" />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=net.wolfy.app"
            target="_blank"
            rel="noopener"
            className="app-btn"
          >
            <img src="/img/assets/download-play.svg" alt="Get it on Google Play" />
          </a>
        </div>
      </div>
    </section>
  );
}
