interface Skin {
  name: string;
  img: string;
  topRank?: number;
}

const skins: Skin[] = [
  { name: "Ainz",       img: "/img/assets/skin-ainz.png",       topRank: 4 },
  { name: "Santithur",  img: "/img/assets/skin-santithur.png",  topRank: 6 },
  { name: "Valand",     img: "/img/assets/skin-valand.png",     topRank: 5 },
  { name: "Top #1",     img: "/img/assets/skin-top1-profile.png", topRank: 1 },
  { name: "Top #2",     img: "/img/assets/skin-top2-profile.png", topRank: 2 },
  { name: "Top #3",     img: "/img/assets/skin-top3-profile.png", topRank: 3 },
];

export function Skins() {
  return (
    <section className="skins">
      <div className="skins-inner">
        <h2>Customize your avatar</h2>
        <p className="skins-subtitle">
          Unlock unique skins as you climb the ranks. Show off your prestige in every game.
        </p>

        <div className="skins-grid">
          {skins.map((skin) => (
            <div key={skin.name} className="skin-card">
              <img src={skin.img} alt={skin.name} className="skin-img" />
              <span className="skin-name">{skin.name}</span>
              {skin.topRank && skin.topRank <= 3 && (
                <span className="skin-top-badge">
                  #{skin.topRank}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
