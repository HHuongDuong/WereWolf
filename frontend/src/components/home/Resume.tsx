export function Resume() {
  return (
    <section className="resume">
      <img
        src="/img/assets/logo-gradient.svg"
        alt="Wolfy logo"
        className="resume-logo-watermark"
        draggable={false}
      />

      <div className="resume-container">
        <div className="resume-mockup">
          <div className="resume-mockup-inner">
            <img src="/img/assets/mockup.png" alt="Mockup" />
          </div>
        </div>

        <div className="resume-text">
          <h1>Wolfy: the online Werewolf game</h1>
          <p className="description">
            Dear player, your village has been infected by Werewolves last
            night. It's time to defend your side! 🧑‍🌾
            <br /><br />
            <span className="more">
              In Wolfy, you play a role with different powers in each game.
              <br />
              Your goal: distinguish manipulations and sincere facts in order to
              protect the village from nocturnal attacks. 🐺
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
