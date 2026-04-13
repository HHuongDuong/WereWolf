// Avatar customizer preview section — visual clone of wolfy.net Skin section

const COLORS = [
  ["#f0ede9", "#f0ede9"],
  ["#262626", "#262626"],
  ["#30303d", "#262626"],
  ["#262626", "#262626"],
  ["#f2cbdb", "#f2cbdb"],
  ["#303b78", "#303b78"],
  ["#4a0404", "#4a0404"],
  ["#262626", "#f0ede9"],
];

// Static skin items using our available assets
const skinItems = [
  { src: "/img/assets/skin-top1-profile.png", rarity: "selected" },
  { src: "/img/assets/skin-top2-profile.png", rarity: "epic" },
  { src: "/img/assets/skin-top3-profile.png", rarity: "epic" },
  { src: "/img/assets/skin-ainz.png",         rarity: "rare" },
  { src: "/img/assets/skin-valand.png",        rarity: "epic" },
  { src: "/img/assets/skin-santithur.png",     rarity: "rare" },
  { src: "/img/assets/skin-top1.svg",          rarity: "epic" },
  { src: "/img/assets/skin-top2.svg",          rarity: "legendary" },
  { src: "/img/assets/skin-top3.svg",          rarity: "legendary" },
];

const placementLeft  = [
  { src: "/img/assets/skin-top1-profile.png", rarity: "rare" },
  { src: "/img/assets/skin-top2-profile.png", rarity: "common" },
];
const placementRight = [
  { src: "/img/assets/skin-top3-profile.png", rarity: "selected" },
  { src: "/img/assets/skin-ainz.png",         rarity: "rare" },
];

export function Skins() {
  return (
    <section className="skins">
      {/* Background scene */}
      <img
        className="skins-scene"
        src="/img/assets/scene_elements/scene_night-special_plain.svg"
        alt="Scene"
      />
      <div className="skins-gradient" />

      <div className="skins-inner">
        <h1 className="skins-title">Customize your avatar throughout the game</h1>

        <div className="skins-main">
          {/* Left: color swatches + item thumbnails */}
          <div className="skins-items-available">
            {/* Color swatches */}
            <div className="skin-colors">
              {COLORS.map(([c1, c2], i) => (
                <div key={i} className="skin-color-swatch">
                  <span style={{ backgroundColor: c1 }} />
                  <span style={{ backgroundColor: c2 }} />
                </div>
              ))}
            </div>

            {/* Skin item grid */}
            <div className="skin-item-grid">
              {skinItems.map((item, i) => (
                <div key={i} className="skin-item-group">
                  <div className={`skin-item ${item.rarity}`}>
                    <div className="skin-item-preview">
                      <img src={item.src} alt="Skin" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center: character preview on platform */}
          <div className="skins-display">
            <div className="skins-display-character">
              <img src="/img/assets/character.svg" alt="Character" />
            </div>
            <div className="skins-display-platform">
              <img src="/img/assets/plateform.svg" alt="Platform" />
            </div>
          </div>

          {/* Right: body + hat placement slots */}
          <div className="skins-placement">
            <div className="skins-placement-row">
              {placementLeft.map((item, i) => (
                <div key={i} className="skin-slot">
                  <div className={`skin-item ${item.rarity}`}>
                    <div className="skin-item-preview">
                      <img src={item.src} alt="Skin" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="skins-placement-row">
              {placementRight.map((item, i) => (
                <div key={`r${i}`} className="skin-slot">
                  <div className={`skin-item ${item.rarity}${i === 1 ? " hat" : ""}`}>
                    <div className="skin-item-preview">
                      <img src={item.src} alt="Skin" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
