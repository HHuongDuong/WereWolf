import { LobbyLayout } from "@/components/layout/LobbyLayout";

export default function LobbyPage() {
  return (
    <LobbyLayout title="The Gathering">
      <div className="rounded-3xl border border-white/10 bg-[#111827] p-8">
        <p className="text-[#9CA3AF]">
          Lobby page skeleton. Render room list, filters, and actions here.
        </p>
      </div>
    </LobbyLayout>
  );
}
