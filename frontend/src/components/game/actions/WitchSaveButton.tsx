import { Button } from "@/components/ui/Button";

interface WitchSaveButtonProps {
  onSave: () => void;
  disabled?: boolean;
  used?: boolean;
}

export function WitchSaveButton({ onSave, disabled = false, used = false }: WitchSaveButtonProps) {
  return (
    <Button
      variant="success"
      onClick={onSave}
      disabled={disabled || used}
      className="w-full"
    >
      {used ? "💚 SAVE POTION USED" : "💚 SAVE A LIFE"}
    </Button>
  );
}
