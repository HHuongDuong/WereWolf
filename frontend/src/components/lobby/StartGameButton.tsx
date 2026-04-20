import { Button } from "@/components/ui/Button";

interface StartGameButtonProps {
  onStart: () => void;
  disabled?: boolean;
  playerCount: number;
}

export function StartGameButton({ onStart, disabled, playerCount }: StartGameButtonProps) {
  return (
    <Button
      variant="primary"
      size="lg"
      onClick={onStart}
      disabled={disabled}
      className="w-full"
    >
      🌕 BEGIN THE NIGHT — {playerCount}/12
    </Button>
  );
}
