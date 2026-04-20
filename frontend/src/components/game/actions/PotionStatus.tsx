interface PotionStatusProps {
  saveUsed: boolean;
  poisonUsed: boolean;
}

export function PotionStatus({ saveUsed, poisonUsed }: PotionStatusProps) {
  return (
    <div className="flex gap-6 justify-center">
      <div className={`px-6 py-3 rounded-2xl border ${saveUsed ? "border-[#4B5563] opacity-60" : "border-[#16A34A]"}`}>
        💚 Save Potion {saveUsed ? "— USED" : "— READY"}
      </div>
      <div className={`px-6 py-3 rounded-2xl border ${poisonUsed ? "border-[#4B5563] opacity-60" : "border-[#DC2626]"}`}>
        ☠️ Poison Potion {poisonUsed ? "— USED" : "— READY"}
      </div>
    </div>
  );
}
