import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../../stores/gameStore";
import { RoleIcon } from "../shared/RoleIcon";

const ROLE_FLAVOR: Record<string, string> = {
  Werewolf: "Hunt by night. Blend in by day. Survive.",
  Villager: "Trust no one. Root out the wolves.",
  Seer:     "You see the truth others cannot.",
  Witch:    "One save, one poison. Choose wisely.",
  Hunter:   "When you fall, you take someone with you.",
};

export function RoleRevealPhase() {
  const myRole = useGameStore(s => s.myRole);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const roleName = myRole ?? "Villager";
  const roleClass = `role-${roleName.toLowerCase()}`;

  return (
    <motion.div
      className="phase-fullscreen role-reveal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="role-reveal-card">
        <p className="role-reveal-eyebrow">Your role has been assigned</p>
        <h1 className="role-reveal-title font-display">You are a</h1>
        <div className={`role-reveal-badge ${roleClass}`}>
          <RoleIcon role={roleName} size={32} />
          <span>{roleName}</span>
        </div>
        <p className="role-reveal-flavor">
          {ROLE_FLAVOR[roleName] ?? ROLE_FLAVOR.Villager}
        </p>
        <p className="role-reveal-countdown">
          Night begins in <span>{countdown}</span>
        </p>
      </div>
    </motion.div>
  );
}
