import { Button } from "@/components/ui/Button";

export function LeaveRoomButton({ onLeave }: { onLeave: () => void }) {
  return (
    <Button variant="danger" onClick={onLeave}>
      LEAVE THE TABLE
    </Button>
  );
}
