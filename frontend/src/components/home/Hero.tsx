import { useState, useEffect, useRef } from "react";

interface ChatMessage {
  id: number;
  avatar?: string;
  username?: string;
  text?: React.ReactNode;
  type?: "normal" | "death" | "repeat";
}

const chatMessages: ChatMessage[] = [
  { id: 1, avatar: "/img/assets/picture-1.svg", username: "Vardiak",
    text: <>I think <span className="mention">@Wolfy</span> is a Werewolf</>, type: "normal" },
  { id: 2, avatar: "/img/assets/picture-2.svg", username: "Wolfy",
    text: "??", type: "normal" },
  { id: 3, avatar: "/img/assets/picture-1.svg", username: "Vardiak",
    text: <><span className="mention">@Wolfy</span> anything to say for yourself?</>, type: "normal" },
  { id: 4, avatar: "/img/assets/picture-2.svg", username: "Wolfy",
    text: <>I see things at night, and <span className="mention">@Reelwens</span> is very suspicious…</>, type: "normal" },
  { id: 5, avatar: "/img/assets/picture-3.svg", username: "Reelwens",
    text: "What?? You are lying.", type: "normal" },
  { id: 6, avatar: "/img/assets/picture-1.svg", username: "Vardiak",
    text: <>Haha, goodbye <span className="mention">@Reelwens</span>!</>, type: "normal" },
  { id: 7, avatar: "/img/assets/picture-3.svg", username: "Reelwens",
    text: ":(", type: "normal" },
  { id: 8, type: "death",
    text: <>You eliminated <span className="mention">Reelwens</span>, who was <span className="role-name">Werewolf</span>.</> },
  { id: 9, type: "repeat" },
];

const delays = [600, 500, 700, 800, 600, 700, 500, 900, 1200];
const MSG_HEIGHT = 72; // px between messages

export function Hero() {
  const [visibleCount, setVisibleCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleNext = (count: number) => {
    if (count >= chatMessages.length) {
      timerRef.current = setTimeout(() => {
        setVisibleCount(0);
        timerRef.current = setTimeout(() => scheduleNext(0), 500);
      }, 3500);
      return;
    }
    timerRef.current = setTimeout(() => {
      setVisibleCount(count + 1);
      scheduleNext(count + 1);
    }, delays[count] ?? 600);
  };

  useEffect(() => {
    scheduleNext(0);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const voteCount = visibleCount >= 6 ? 3 : visibleCount >= 4 ? 2 : visibleCount >= 1 ? 1 : 0;
  const visibleMsgs = chatMessages.slice(0, visibleCount);

  return (
    <section className="hero">
      {/* SVG Scene (sky, moon, trees) — placed via SceneContainer equivalent */}
      <div className="hero-scene">
        <img src="/img/assets/scene_elements/scene_night-special_plain.svg" alt="" role="presentation" />
      </div>
      <div className="hero-gradient" />

      {/* Landing container */}
      <div className="hero-content">
        {/* Character + votes */}
        <div className="hero-character">
          {voteCount > 0 && (
            <div className="vote-bubble">
              <div className="vote-count">{voteCount}</div>
              <div className="vote-avatars">
                {["/img/assets/picture-1.svg", "/img/assets/picture-3.svg", "/img/assets/picture-4.svg"]
                  .slice(0, voteCount)
                  .map((src, i) => (
                    <div key={i} className="vote-avatar">
                      <img src={src} alt="voter" />
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="character-stage">
            <div className="character-platform">
              <img src="/img/assets/plateform.svg" alt="Platform" />
            </div>
            <div className="character-figure">
              <img src="/img/assets/character.svg" alt="Character" />
            </div>
          </div>
        </div>

        {/* Chat — floating pill messages */}
        <div className="hero-chat">
          {visibleMsgs.map((msg, i) => {
            const offsetY = -(visibleMsgs.length - 1 - i) * MSG_HEIGHT;

            if (msg.type === "repeat") {
              return (
                <div key={msg.id} className="chat-msg repeat-msg visible" style={{ transform: `translate(0px, ${offsetY}px)` }}>
                  <img src="/img/icons/refresh-arrow.svg" alt="" className="repeat-icon" />
                  <span className="repeat-text">Play again?</span>
                </div>
              );
            }

            if (msg.type === "death") {
              return (
                <div key={msg.id} className="chat-msg death-msg visible" style={{ transform: `translate(0px, ${offsetY}px)` }}>
                  <div className="skull-wrap">
                    <img src="/img/icons/cute-skull-red.svg" alt="eliminated" className="skull-icon" />
                  </div>
                  <span className="chat-death-text">{msg.text}</span>
                </div>
              );
            }

            return (
              <div key={msg.id} className="chat-msg visible" style={{ transform: `translate(0px, ${offsetY}px)` }}>
                <div className="chat-avatar">
                  <img src={msg.avatar} alt={msg.username} />
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

      {/* CTA play button */}
      <a href="/auth/register" className="hero-cta">
        <img src="/img/icons/play-button.svg" alt="" />
        <span className="hero-cta-text">Play Wolfy</span>
      </a>
    </section>
  );
}
