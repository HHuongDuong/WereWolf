import { useState, useRef } from "react";

type Team = "werewolves" | "villagers" | "solo";

interface Role {
  name: string;
  img: string;
  team: Team;
  description: string;
}

const roles: Role[] = [
  {
    name: "Werewolf",
    img: "/img/assets/cards/werewolf.svg",
    team: "werewolves",
    description:
      "During the night, Werewolves join together and vote on who to eliminate. During the day, they must blend in with the villagers to avoid being unmasked.",
  },
  {
    name: "Black Wolf",
    img: "/img/assets/cards/black_wolf.svg",
    team: "werewolves",
    description:
      "A powerful werewolf who can infect a villager during the night, turning them into a werewolf. Uses their power carefully to avoid suspicion.",
  },
  {
    name: "Talkative Wolf",
    img: "/img/assets/cards/talkative_wolf.svg",
    team: "werewolves",
    description:
      "A wolf who can communicate during the day in a secret channel shared only with the werewolf team.",
  },
  {
    name: "Literate Wolf",
    img: "/img/assets/cards/literate_wolf.svg",
    team: "werewolves",
    description:
      "This cunning werewolf can leave anonymous messages in the village chat at night to sow confusion.",
  },
  {
    name: "Wolf Riding Hood",
    img: "/img/assets/cards/wolf_riding_hood.svg",
    team: "werewolves",
    description:
      "Disguised as Little Red Riding Hood, this wolf hides among the villagers. If eliminated, the village believes they killed an innocent.",
  },
  {
    name: "White Wolf",
    img: "/img/assets/cards/white_wolf.svg",
    team: "solo",
    description:
      "Lone wolf who appears among the werewolves each night and can eliminate one of them. Wins alone when they are the last survivor.",
  },
  {
    name: "Mercenary",
    img: "/img/assets/cards/mercenary.svg",
    team: "solo",
    description:
      "A ruthless mercenary with a secret target. Wins when the target is eliminated, regardless of which side falls.",
  },
  {
    name: "Sick Rat",
    img: "/img/assets/cards/sick_rat.svg",
    team: "solo",
    description:
      "A desperate creature who infects the first player who attacks them, spreading a plague that changes the game.",
  },
  {
    name: "Rumplestiltskin",
    img: "/img/assets/cards/rumplestiltskin.svg",
    team: "solo",
    description:
      "A trickster who wins if nobody guesses their role. Must survive until the end while keeping their identity secret.",
  },
  {
    name: "Seer",
    img: "/img/assets/cards/seer.svg",
    team: "villagers",
    description:
      "Each night, the Seer learns the true identity of one player. They must guide the village without revealing themselves.",
  },
  {
    name: "Witch",
    img: "/img/assets/cards/witch.svg",
    team: "villagers",
    description:
      "Possesses two potions — one to save the werewolves' victim, one to eliminate any player. Each can only be used once per game.",
  },
  {
    name: "Villager",
    img: "/img/assets/cards/villager.svg",
    team: "villagers",
    description:
      "An ordinary villager with no special powers, but with a sharp mind. Their voice and vote are crucial to identify the werewolves.",
  },
  {
    name: "Talkative Seer",
    img: "/img/assets/cards/talkative_seer.svg",
    team: "villagers",
    description:
      "Like the Seer, but must publicly reveal the result of each night's investigation to the village.",
  },
  {
    name: "Aura Seer",
    img: "/img/assets/cards/aura_seer.svg",
    team: "villagers",
    description:
      "Sees whether a player's aura is bright (innocent) or dark (suspicious). Less precise, but very valuable.",
  },
  {
    name: "Healer",
    img: "/img/assets/cards/healer_witch.svg",
    team: "villagers",
    description:
      "Can protect a different player each night from werewolf attacks. Cannot protect the same person twice in a row.",
  },
  {
    name: "Poisoner",
    img: "/img/assets/cards/poisoner_witch.svg",
    team: "villagers",
    description:
      "Can poison one player per night. The poisoned player will die at the following dawn unless cured.",
  },
  {
    name: "Pink Riding Hood",
    img: "/img/assets/cards/pink_riding_hood.svg",
    team: "villagers",
    description:
      "If devoured by the werewolves, she takes one of them with her into death.",
  },
  {
    name: "Blue Riding Hood",
    img: "/img/assets/cards/blue_riding_hood.svg",
    team: "villagers",
    description:
      "Has a special bond — if their partner dies, they die too. Their shared fate makes them more powerful together.",
  },
  {
    name: "Hunter",
    img: "/img/assets/cards/hunter.svg",
    team: "villagers",
    description:
      "When eliminated, can immediately shoot another player. A powerful deterrent against werewolf aggression.",
  },
  {
    name: "Cupid",
    img: "/img/assets/cards/cupid.svg",
    team: "villagers",
    description:
      "Links two players with a love bond on the first night. If one dies, the other follows. Can create unexpected alliances.",
  },
  {
    name: "Guard",
    img: "/img/assets/cards/guard.svg",
    team: "villagers",
    description:
      "Can protect a player each night by standing guard. Immune to werewolf attacks when on duty.",
  },
  {
    name: "Little Girl",
    img: "/img/assets/cards/little_girl.svg",
    team: "villagers",
    description:
      "Can secretly peek during the werewolves' phase. If spotted by a wolf while peeking, she is immediately eliminated.",
  },
  {
    name: "Necromancer",
    img: "/img/assets/cards/necromencer.svg",
    team: "villagers",
    description:
      "Can communicate with dead players once per game to get crucial information from beyond the grave.",
  },
  {
    name: "Gravedigger",
    img: "/img/assets/cards/gravedigger.svg",
    team: "villagers",
    description:
      "Learns the role of the last player eliminated each morning. Slowly builds a picture of who's who.",
  },
  {
    name: "Dictator",
    img: "/img/assets/cards/dictator.svg",
    team: "villagers",
    description:
      "Once per game, can override the village vote and force an elimination of their chosen target.",
  },
  {
    name: "Mentalist",
    img: "/img/assets/cards/mentalist.svg",
    team: "villagers",
    description:
      "Senses a link between two players each night — either they are on the same team, or they are enemies.",
  },
  {
    name: "Heir",
    img: "/img/assets/cards/heir.svg",
    team: "villagers",
    description:
      "Inherits the power of the last special villager to die. Grows stronger as the game progresses.",
  },
  {
    name: "Pyromancer",
    img: "/img/assets/cards/pyromancer.svg",
    team: "villagers",
    description:
      "Spends nights covering a player in oil. When they ignite, all oiled players burn simultaneously.",
  },
  {
    name: "Plunderer",
    img: "/img/assets/cards/plunderer.svg",
    team: "villagers",
    description:
      "Steals the power of any eliminated player, gaining their ability for the rest of the game.",
  },
  {
    name: "Red Riding Hood",
    img: "/img/assets/cards/red_riding_hood.svg",
    team: "villagers",
    description:
      "Learns if the player next to her in the village circle is a werewolf or not. A simple but vital power.",
  },
];

const CARDS_VISIBLE = 5;

const teamLabel: Record<Team, string> = {
  werewolves: "Werewolves Side",
  villagers: "Villagers Side",
  solo: "Solo",
};

export function Roles() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const cardWidth = 96; // 80px card + 16px gap
  const maxOffset = Math.max(0, roles.length - CARDS_VISIBLE);

  const slide = (dir: -1 | 1) => {
    setOffset(o => Math.min(Math.max(0, o + dir * CARDS_VISIBLE), maxOffset));
  };

  const active = roles[activeIndex]!;

  return (
    <section className="roles">
      <h2 className="roles-title">Play one of the {roles.length} roles to discover</h2>

      <div className="roles-layout">
        {/* Role info panel */}
        <div className="role-info">
          <div className="role-info-header">
            <span className="role-info-name">{active.name}</span>
            <span className={`role-team-badge ${active.team}`}>
              {teamLabel[active.team]}
            </span>
          </div>
          <p className="role-info-description">{active.description}</p>
        </div>

        {/* Carousel */}
        <div className="roles-carousel-wrapper">
          <button
            className="carousel-arrow left"
            onClick={() => slide(-1)}
            disabled={offset === 0}
            style={{ opacity: offset === 0 ? 0.3 : 1 }}
          >
            <img src="/img/icons/arrow-long-left.svg" alt="Previous" />
          </button>

          <div
            ref={trackRef}
            className="roles-carousel-track"
            style={{ transform: `translateX(-${offset * cardWidth}px)` }}
          >
            {roles.map((role, i) => (
              <div
                key={role.name}
                className={`role-card${activeIndex === i ? " active" : ""}`}
                onClick={() => setActiveIndex(i)}
              >
                <div className={`role-card-img-wrap ${role.team}`}>
                  <img src={role.img} alt={role.name} />
                </div>
                <span className="role-card-name">{role.name}</span>
              </div>
            ))}
          </div>

          <button
            className="carousel-arrow right"
            onClick={() => slide(1)}
            disabled={offset >= maxOffset}
            style={{ opacity: offset >= maxOffset ? 0.3 : 1 }}
          >
            <img src="/img/icons/arrow-long-right.svg" alt="Next" />
          </button>
        </div>
      </div>
    </section>
  );
}
