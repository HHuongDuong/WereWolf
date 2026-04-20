import { Button } from "@/components/ui/Button";

interface WitchPoisonButtonProps {
  onPoison: () => void;
  disabled?: boolean;
  used?: boolean;
}

export function WitchPoisonButton({ onPoison, disabled = false, used = false }: WitchPoisonButtonProps) {
  return (
    <Button
      variant="danger"
      onClick={onPoison}
      disabled={disabled || used}
      className="w-full"
    >
      {used ? "☠️ POISON USED" : "☠️ POISON SOMEONE"}
    </Button>
  );
}
