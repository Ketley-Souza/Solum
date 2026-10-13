import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "../types/auth";

/** Duração padrão de sessão: 8 horas em ms */
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

interface AuthSession {
  token: string;
  profile: Profile;
  user?: { id: string; name: string; email: string };
  /** Timestamp Unix (ms) em que o token expira. Opcional — backend pode informar. */
  expiresAt?: number;
}

interface AuthState {
  token: string | null;
  profile: Profile | null;
  user: AuthSession["user"] | null;
  /** Timestamp Unix (ms) em que a sessão expira. Null = sem expiração definida. */
  expiresAt: number | null;
  setAuth: (session: AuthSession) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      profile: null,
      user: null,
      expiresAt: null,
      setAuth: (session) =>
        set({
          token: session.token,
          profile: session.profile,
          user: session.user ?? null,
          // Usa o expiresAt do backend se disponível; caso contrário aplica a duração padrão.
          expiresAt: session.expiresAt ?? Date.now() + SESSION_DURATION_MS,
        }),
      clearAuth: () => set({ token: null, profile: null, user: null, expiresAt: null }),
    }),
    { name: "solum-auth" },
  ),
);
