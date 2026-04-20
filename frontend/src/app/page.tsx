import { LobbyLayout } from "@/components/layout/LobbyLayout";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <LobbyLayout title="Under the Full Moon">
      <div className="max-w-3xl">
        <p className="text-[#9CA3AF] text-lg">
          Welcome to the Werewolf lobby. Create a room or join an existing table.
        </p>
        <div className="mt-8 flex gap-4">
          <Button>CREATE ROOM</Button>
          <Button variant="secondary">JOIN ROOM</Button>
        </div>
      </div>
    </LobbyLayout>
  );
}
