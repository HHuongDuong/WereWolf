import { useState, useEffect, useRef } from "react";

interface ChatMessage {
  id: number;
  avatar?: string;
  username?: string;
  text?: React.ReactNode;
  type?: "normal" | "death" | "repeat";
}

const chatMessages: ChatMessage[] = [
  {
    id: 1,
    avatar: "/img/assets/picture-1.svg",
    username: "Vardiak",
    text: <>I think <span className="mention">@Wolfy</span> is a Werewolf</>,
    type: "normal",
  },
  {
    id: 2,
    avatar: "/img/assets/picture-2.svg",
    username: "Wolfy",
    text: "??",
    type: "normal",
  },
  {
    id: 3,
    avatar: "/img/assets/picture-1.svg",
    username: "Vardiak",
    text: <><span className="mention">@Wolfy</span> anything to say for yourself?</>,
    type: "normal",
  },
  {
    id: 4,
    avatar: "/img/assets/picture-2.svg",
    username: "Wolfy",
    text: <>I see things at night, and <span className="mention">@Reelwens</span> is very suspicious…</>,
    type: "normal",
  },
  {
    id: 5,
    avatar: "/img/assets/picture-3.svg",
    username: "Reelwens",
    text: "What?? You are lying.",
    type: "normal",
  },
  {
    id: 6,
    avatar: "/img/assets/picture-1.svg",
    username: "Vardiak",
    text: <>Haha, goodbye <span className="mention">@Reelwens</span>!</>,
    type: "normal",
  },
  {
    id: 7,
    avatar: "/img/assets/picture-3.svg",
    username: "Reelwens",
    text: ":(",
    type: "normal",
  },
  {
    id: 8,
    type: "death",
    text: <>You eliminated <span className="mention">Reelwens</span>, who was <span className="role-name">Werewolf</span>.</>,
  },
  {
    id: 9,
    type: "repeat",
  },
];

export function Hero() {
  const [visibleCount, setVisibleCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const delays = [600, 500, 700, 800, 600, 700, 500, 900, 1200];

  const scheduleNext = (count: number) => {
    if (count >= chatMessages.length) {
      // Pause then restart
      timerRef.current = setTimeout(() => {
        setVisibleCount(0);
        timerRef.current = setTimeout(() => scheduleNext(0), 500);
      }, 3500);
      return;
    }
    const delay = delays[count] ?? 600;
    timerRef.current = setTimeout(() => {
      setVisibleCount(count + 1);
      scheduleNext(count + 1);
    }, delay);
  };

  useEffect(() => {
    scheduleNext(0);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <section className="hero">
      {/* Sky gradient */}
      <div className="hero-sky" />

      {/* Stars */}
      <div className="hero-stars" />

      {/* Moon */}
      <div className="hero-moon">
        <div className="moon-glow" />
        <div className="moon-body" />
      </div>

      {/* Village scene */}
      <div className="hero-scene">
        <img src="/img/assets/scene_elements/scene_night-special_plain.svg" alt="" role="presentation" />
      </div>
      <div className="hero-gradient" />

      {/* Content */}
      <div className="hero-content">
        {/* Character + votes */}
        <div className="hero-character">
          <div className="vote-bubble">
            <span className="vote-count">3</span>
            <div className="vote-avatars">
              <div className="vote-avatar">
                <img src="/img/assets/picture-1.svg" alt="voter" loading="lazy" />
              </div>
              <div className="vote-avatar">
                <img src="/img/assets/picture-3.svg" alt="voter" loading="lazy" />
              </div>
              <div className="vote-avatar">
                <img src="/img/assets/picture-4.svg" alt="voter" loading="lazy" />
              </div>
            </div>
          </div>

          <div className="character-stage">
            <img src="/img/assets/plateform.svg" alt="Platform" className="character-platform" />
            <img src="/img/assets/character.svg" alt="Character" className="character-figure" />
          </div>
        </div>

        {/* Chat window */}
        <div className="hero-chat">
          <div className="chat-header-bar">
            <div className="chat-dot" />
            <span>Village chat</span>
          </div>

          <div className="chat-messages">
            {chatMessages.slice(0, visibleCount).map((msg) => {
              if (msg.type === "repeat") {
                return (
                  <div key={msg.id} className="chat-repeat">
                    <img src="/img/icons/refresh-arrow.svg" alt="" className="repeat-icon" />
                    <span>Play again?</span>
                  </div>
                );
              }
              if (msg.type === "death") {
                return (
                  <div key={msg.id} className={`chat-msg death-msg visible`}>
                    <img src="/img/icons/cute-skull-red.svg" alt="eliminated" className="skull-icon" />
                    <div className="chat-death-text">{msg.text}</div>
                  </div>
                );
              }
              return (
                <div key={msg.id} className="chat-msg visible">
                  <div className="chat-avatar">
                    <img src={msg.avatar} alt={msg.username} loading="lazy" />
                  </div>
                  <div className="chat-msg-body">
                    <div className="chat-username">{msg.username}</div>
                    <div className="chat-text">{msg.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="hero-bottom">
        <a href="/auth/register" className="hero-cta">
          <img src="/img/icons/play-button.svg" alt="" />
          Play Wolfy
        </a>
        <div className="scroll-indicator">
          <img src="/img/icons/scroll-down.svg" alt="Scroll down" />
        </div>
      </div>
    </section>
  );
}
