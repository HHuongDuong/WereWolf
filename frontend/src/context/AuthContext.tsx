import { createContext, useContext, useState } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const STORAGE_KEY = "wolfy_dev_user";

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);

  function login(user: User) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setUser(user);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export const DEV_USER: User = {
  id: "dev-001",
  username: "DevWolf",
  email: "dev@wolfy.local",
};
