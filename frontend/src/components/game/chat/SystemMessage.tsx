import { motion } from "framer-motion";

interface SystemMessageProps {
  content: string;
  type?: "normal" | "death" | "vote";
}

export function SystemMessage({ content, type = "normal" }: SystemMessageProps) {
  const colors = {
    normal: "text-[#F59E0B]",
    death: "text-[#DC2626]",
    vote: "text-[#7C3AED]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center my-4"
    >
      <div
        className={`
          px-6 py-2 text-sm font-medium tracking-widest rounded-2xl border
          ${colors[type]} border-white/10 bg-black/40
        `}
      >
        {type === "death" && "☠️ "}
        {type === "vote" && "⚖️ "}
        {content}
      </div>
    </motion.div>
  );
}
