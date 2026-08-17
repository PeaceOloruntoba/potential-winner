import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../types";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

// Persisted to localStorage so a page refresh doesn't kick the person back
// to /login — the axios interceptor and route guards both read from here.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    { name: "scholify-auth" }
  )
);
