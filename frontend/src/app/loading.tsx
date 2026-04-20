import { Skeleton } from "@/components/ui/Skeleton";
import { LobbyLayout } from "@/components/layout/LobbyLayout";

export default function Loading() {
  return (
    <LobbyLayout title="Summoning the Pack...">
      <div className="flex flex-wrap gap-4 mb-12">
        <Skeleton width="200px" height="56px" />
        <Skeleton width="200px" height="56px" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} height="220px" className="rounded-xl" />
        ))}
      </div>
    </LobbyLayout>
  );
}
