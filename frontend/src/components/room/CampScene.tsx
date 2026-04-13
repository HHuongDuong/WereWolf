export function CampScene() {
  return (
    <div className="camp-scene">
      {/* Sky gradient layers */}
      <div className="camp-sky camp-sky-sun" />
      <div className="camp-sky camp-sky-night" />
      <div className="camp-sky camp-sky-day" />

      {/* Scene simulation — right side decorative panel */}
      <div className="camp-scene-simulation">
        <div className="camp-scene-sim-bottom" />
        <img
          className="camp-scene-sim-img"
          src="/img/assets/scene_elements/plain_circle/sceneSimulation.svg"
          alt=""
          draggable={false}
        />
      </div>

      {/* Sun (astre_day) */}
      <img
        className="camp-scene-el camp-astre-day"
        src="/img/assets/scene_elements/astre_day.svg"
        alt=""
        draggable={false}
      />

      {/* Clouds — scrolling */}
      <div
        className="camp-clouds"
        style={{ backgroundImage: "url('/img/assets/scene_elements/clouds.svg')" }}
      />

      {/* Ground background circle */}
      <img
        className="camp-scene-el"
        src="/img/assets/scene_elements/plain_circle/background.svg"
        alt=""
        draggable={false}
      />

      {/* Plains layer (trees / vegetation) */}
      <img
        className="camp-scene-el"
        src="/img/assets/scene_elements/plain_circle/plains.svg"
        alt=""
        draggable={false}
      />

    </div>
  );
}
