import { LobbyLayout } from "@/components/layout/LobbyLayout";
import LobbyView from "@/features/lobby/LobbyView";

export default function HomePage() {
  return (
    <LobbyLayout title="Under the Full Moon">
      <LobbyView />
    </LobbyLayout>
  );
}
