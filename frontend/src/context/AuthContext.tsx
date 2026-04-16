import { createContext, useContext, useState } from "react";

const GUEST_ID_KEY   = "wolfy_guest_id";
const GUEST_NAME_KEY = "wolfy_guest_name";

export interface Guest {
  guestId: string;
  displayName: string;
}

interface GuestContextValue {
  guest: Guest;
  setDisplayName: (name: string) => void;
}

const GuestContext = createContext<GuestContextValue | null>(null);

const GUEST_ID_RE = /^guest_[a-zA-Z0-9]{10}$/;

function initGuest(): Guest {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId || !GUEST_ID_RE.test(guestId)) {
    const uid = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "")
      : Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, "0")).join("");
    guestId = "guest_" + uid.slice(0, 10);
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  const displayName =
    localStorage.getItem(GUEST_NAME_KEY) ?? "Wolf_" + guestId.slice(-4);
  return { guestId, displayName };
}

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [guest, setGuest] = useState<Guest>(initGuest);

  function setDisplayName(name: string) {
    localStorage.setItem(GUEST_NAME_KEY, name);
    setGuest(g => ({ ...g, displayName: name }));
  }

  return (
    <GuestContext.Provider value={{ guest, setDisplayName }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error("useGuest must be used inside <GuestProvider>");
  return ctx;
}
