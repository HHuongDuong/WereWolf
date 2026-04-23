import { motion } from "framer-motion";

interface SystemMessageProps {
  content: string;
  type?: "normal" | "death" | "vote" | "important";
}

export function SystemMessage({ content, type = "normal" }: SystemMessageProps) {
  const colors: Record<string, string> = {
    normal: "text-amber-500/80 border-slate-800 bg-slate-900/40",
    death: "text-red-500/90 border-red-900/40 bg-red-950/40 shadow-[0_0_15px_rgba(153,27,27,0.2)]",
    vote: "text-purple-400/80 border-purple-900/40 bg-purple-950/30",
    important: "text-red-400 border-red-900/60 bg-red-950/40 font-bold",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center my-4"
    >
      <div
        className={`
          px-6 py-2 text-sm tracking-[0.1em] rounded-xl border font-accent italic
          ${colors[type] || colors.normal} backdrop-blur-sm
        `}
      >
        {type === "death" && "☠️ "}
        {type === "vote" && "⚖️ "}
        {content}
      </div>
    </motion.div>
  );
}
