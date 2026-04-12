export function CampScene() {
  return (
    <div className="camp-scene">
      {/* Sky layers */}
      <div className="camp-sky">
        <div className="camp-sky-night" />
        <div
          className="camp-stars camp-stars-1"
          style={{ backgroundImage: "url('/img/assets/scene_elements/stars_1.svg')" }}
        />
        <div
          className="camp-stars camp-stars-2"
          style={{ backgroundImage: "url('/img/assets/scene_elements/stars_2.svg')" }}
        />
        <div className="camp-moon">
          <img src="/img/assets/scene_elements/astre_night.svg" alt="" />
        </div>
        <div
          className="camp-clouds"
          style={{ backgroundImage: "url('/img/assets/scene_elements/clouds.svg')" }}
        />
      </div>

      {/* Ground / scene background */}
      <div className="camp-ground">
        <img
          className="camp-bg-img"
          src="/img/assets/scene_elements/plain_circle/background_night.svg"
          alt=""
        />
        <div className="camp-ground-color" />
      </div>

      {/* Scene simulation (right decorative side) */}
      <div className="camp-scene-simulation">
        <img
          src="/img/assets/scene_elements/plain_circle/sceneSimulation_night.svg"
          alt=""
        />
        <div className="camp-scene-sim-bottom" />
      </div>
    </div>
  );
}
