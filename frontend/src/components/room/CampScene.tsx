export function CampScene() {
  return (
    <div className="camp-scene">
      {/* Sky layers — day scene */}
      <div className="camp-sky">
        <div className="camp-sky-day" />
        <div
          className="camp-clouds"
          style={{ backgroundImage: "url('/img/assets/scene_elements/clouds.svg')" }}
        />
      </div>

      {/* Ground / scene background */}
      <div className="camp-ground">
        <img
          className="camp-bg-img"
          src="/img/assets/scene_elements/plain_circle/background.svg"
          alt=""
        />
        <div className="camp-ground-color" />
      </div>

      {/* Scene simulation (right decorative side) */}
      <div className="camp-scene-simulation">
        <img
          src="/img/assets/scene_elements/plain_circle/sceneSimulation.svg"
          alt=""
        />
        <div className="camp-scene-sim-bottom" />
      </div>
    </div>
  );
}
