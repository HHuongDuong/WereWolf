import { Button } from "@/components/ui/Button";

export function KickPlayerButton({ onKick }: { onKick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onKick}
      className="text-[#DC2626] hover:text-[#F87171]"
    >
      KICK
    </Button>
  );
}
