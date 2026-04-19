"use client";

import { useGameSocket } from "@/hooks/useGameSocket";
import { Toast } from "@/components/ui/toast";
import { useGameStore } from "@/store/gameStore";
import { useEffect } from "react";

export function GameProvider({ children }: { children: React.ReactNode }) {
  // Initialize socket connection and map events to store
  useGameSocket();

  const toastParams = useGameStore((state) => state.toast);
  const clearToast = useGameStore((state) => state.clearToast);
  const setMyGuestId = useGameStore((state) => state.setMyGuestId);

  // Generate or retrieve guestId on mount
  useEffect(() => {
    let guestId = sessionStorage.getItem("guestId");
    if (!guestId) {
      guestId = "guest_" + Math.random().toString(36).substring(2, 12);
      sessionStorage.setItem("guestId", guestId);
    }
    setMyGuestId(guestId);
  }, [setMyGuestId]);

  return (
    <>
      {children}
      <Toast
        message={toastParams?.message || null}
        type={toastParams?.type}
        onClose={clearToast}
      />
    </>
  );
}
