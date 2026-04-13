import { useState } from "react";

type Team = "werewolves" | "villagers" | "solo";

interface Role {
  name: string;
  img: string;
  team: Team;
  description: string;
}

const roles: Role[] = [
  { name: "Werewolf", img: "/img/assets/cards/werewolf.svg", team: "werewolves",
    description: "During the night, Werewolves join together and vote on who to eliminate. During the day, they must blend in with the villagers to avoid being unmasked." },
  { name: "Black Wolf", img: "/img/assets/cards/black_wolf.svg", team: "werewolves",
    description: "A powerful werewolf who can infect a villager during the night, turning them into a werewolf. Uses their power carefully to avoid suspicion." },
  { name: "Talkative Wolf", img: "/img/assets/cards/talkative_wolf.svg", team: "werewolves",
    description: "A wolf who can communicate during the day in a secret channel shared only with the werewolf team." },
  { name: "Literate Wolf", img: "/img/assets/cards/literate_wolf.svg", team: "werewolves",
    description: "This cunning werewolf can leave anonymous messages in the village chat at night to sow confusion." },
  { name: "Wolf Riding Hood", img: "/img/assets/cards/wolf_riding_hood.svg", team: "werewolves",
    description: "Disguised as Little Red Riding Hood, this wolf hides among the villagers. If eliminated, the village believes they killed an innocent." },
  { name: "White Wolf", img: "/img/assets/cards/white_wolf.svg", team: "solo",
    description: "Lone wolf who appears among the werewolves each night and can eliminate one of them. Wins alone when they are the last survivor." },
  { name: "Mercenary", img: "/img/assets/cards/mercenary.svg", team: "solo",
    description: "A ruthless mercenary with a secret target. Wins when the target is eliminated, regardless of which side falls." },
  { name: "Sick Rat", img: "/img/assets/cards/sick_rat.svg", team: "solo",
    description: "A desperate creature who infects the first player who attacks them, spreading a plague that changes the game." },
  { name: "Rumplestiltskin", img: "/img/assets/cards/rumplestiltskin.svg", team: "solo",
    description: "A trickster who wins if nobody guesses their role. Must survive until the end while keeping their identity secret." },
  { name: "Seer", img: "/img/assets/cards/seer.svg", team: "villagers",
    description: "Each night, the Seer learns the true identity of one player. They must guide the village without revealing themselves." },
  { name: "Witch", img: "/img/assets/cards/witch.svg", team: "villagers",
    description: "Possesses two potions — one to save the werewolves' victim, one to eliminate any player. Each can only be used once per game." },
  { name: "Villager", img: "/img/assets/cards/villager.svg", team: "villagers",
    description: "An ordinary villager with no special powers, but with a sharp mind. Their voice and vote are crucial to identify the werewolves." },
  { name: "Healer", img: "/img/assets/cards/healer_witch.svg", team: "villagers",
    description: "Can protect a different player each night from werewolf attacks. Cannot protect the same person twice in a row." },
  { name: "Hunter", img: "/img/assets/cards/hunter.svg", team: "villagers",
    description: "When eliminated, can immediately shoot another player. A powerful deterrent against werewolf aggression." },
  { name: "Cupid", img: "/img/assets/cards/cupid.svg", team: "villagers",
    description: "Links two players with a love bond on the first night. If one dies, the other follows. Can create unexpected alliances." },
  { name: "Guard", img: "/img/assets/cards/guard.svg", team: "villagers",
    description: "Can protect a player each night by standing guard. Immune to werewolf attacks when on duty." },
  { name: "Little Girl", img: "/img/assets/cards/little_girl.svg", team: "villagers",
    description: "Can secretly peek during the werewolves' phase. If spotted by a wolf while peeking, she is immediately eliminated." },
  { name: "Gravedigger", img: "/img/assets/cards/gravedigger.svg", team: "villagers",
    description: "Learns the role of the last player eliminated each morning. Slowly builds a picture of who's who." },
  { name: "Dictator", img: "/img/assets/cards/dictator.svg", team: "villagers",
    description: "Once per game, can override the village vote and force an elimination of their chosen target." },
  { name: "Heir", img: "/img/assets/cards/heir.svg", team: "villagers",
    description: "Inherits the power of the last special villager to die. Grows stronger as the game progresses." },
  { name: "Red Riding Hood", img: "/img/assets/cards/red_riding_hood.svg", team: "villagers",
    description: "Learns if the player next to her in the village circle is a werewolf or not. A simple but vital power." },
];

const teamLabel: Record<Team, string> = {
  werewolves: "Werewolves Side",
  villagers: "Villagers Side",
  solo: "Solo",
};

// Slot positions: -2, -1, 0 (center), 1, 2
const SLOTS = [-2, -1, 0, 1, 2] as const;

function getPosClass(slot: number): string {
  if (slot === 0)  return "role-pos-center";
  if (slot === -1) return "role-pos-left-1";
  if (slot === -2) return "role-pos-left-2";
  if (slot === 1)  return "role-pos-right-1";
  if (slot === 2)  return "role-pos-right-2";
  return "role-pos-hidden";
}

export function Roles() {
  const [activeIndex, setActiveIndex] = useState(0);

  const slide = (dir: -1 | 1) => {
    setActiveIndex(i => (i + dir + roles.length) % roles.length);
  };

  const active = roles[activeIndex]!;

  // For each slot, get the role at that position
  const slotRoles = SLOTS.map(slot => {
    const idx = (activeIndex + slot + roles.length) % roles.length;
    return { slot, role: roles[idx]!, idx };
  });

  return (
    <section className="roles">
      <h2 className="roles-title">Play one of the {roles.length} roles to discover</h2>

      {/* Role info bar */}
      <div className="role-container">
        <div className="role-info">
          <h3 className="role-info-name">{active.name}</h3>
          <p className={`role-team ${active.team}`}>{teamLabel[active.team]}</p>
        </div>

        <div className="role-description-box">
          <p className="role-description-text">{active.description}</p>
        </div>
      </div>

      {/* Circular slider */}
      <div className="role-slider">
        <div className="role-slider-inner">
          {/* Rotating dashed ring */}
          <img
            className="role-dash-round"
            src="/img/assets/rounded-dash.svg"
            alt=""
            draggable={false}
          />

          {/* Left arrow */}
          <button className="role-arrow left" onClick={() => slide(-1)} aria-label="Previous role">
            <img src="/img/icons/arrow-long-left.svg" alt="Previous" />
          </button>

          {/* Right arrow */}
          <button className="role-arrow right" onClick={() => slide(1)} aria-label="Next role">
            <img src="/img/icons/arrow-long-right.svg" alt="Next" />
          </button>

          {/* Role cards positioned in ring */}
          {slotRoles.map(({ slot, role, idx }) => (
            <div
              key={`${slot}-${idx}`}
              className={`role-card ${getPosClass(slot)}`}
              onClick={() => slot !== 0 && setActiveIndex(idx)}
            >
              <div className={`role-card-img-wrap ${role.team}`}>
                <img src={role.img} alt={role.name} draggable={false} />
              </div>
              <span className="role-card-name">{role.name}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="role-help">Click on another role to discover it</p>
    </section>
  );
}
