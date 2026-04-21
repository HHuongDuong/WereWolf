"use client";

import { useState, useEffect } from "react";
import { LobbyLayout } from "@/components/layout/LobbyLayout";
import LobbyView from "@/features/lobby/LobbyView";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate game asset loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000); // 4 seconds of dark fantasy loading
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <LobbyLayout>
      <LobbyView />
    </LobbyLayout>
  );
}
