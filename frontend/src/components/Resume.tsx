export function Resume() {
  return (
    <section className="resume">
      <img
        src="/img/assets/logo-gradient.svg"
        alt=""
        className="resume-logo-watermark"
      />

      <div className="resume-container">
        <div className="resume-mockup">
          <img src="/img/assets/mockup.png" alt="Wolfy game interface" />
        </div>

        <div className="resume-text">
          <h1>Wolfy: the online Werewolf game</h1>
          <p className="description">
            Dear player, your village has been infected by Werewolves last
            night. It's time to defend your side! 🧑‍🌾
          </p>
          <p className="more">
            In Wolfy, you play a role with different powers in each game.
            <br />
            Your goal: distinguish manipulations and sincere facts in order to
            protect the village from nocturnal attacks. 🐺
          </p>
        </div>
      </div>
    </section>
  );
}
