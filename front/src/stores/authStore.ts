import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Profile } from "../types/auth";
import { logger } from "./middleware";

// ─── Constantes ──────────────────────────────────────────────────

/** Mantém a sessão alinhada ao prazo de expiração do JWT do backend. */
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

// ─── Tipos ───────────────────────────────────────────────────────

/** Dados do usuário autenticado. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
}

/** Payload recebido ao criar uma sessão (login/cadastro). */
export interface AuthSession {
  token: string;
  profile: Profile;
  user?: AuthUser;
  /** Timestamp Unix (ms) em que o token expira. Opcional — backend pode informar. */
  expiresAt?: number;
}

/** Estado + ações do authStore. */
export interface AuthState {
  // ─── Estado ──────────────────────
  token: string | null;
  profile: Profile | null;
  user: AuthUser | null;
  /** Timestamp Unix (ms) em que a sessão expira. Null = sem expiração definida. */
  expiresAt: number | null;
  /** Indica que a sessão persistida já foi carregada do navegador. */
  hasHydrated: boolean;

  // ─── Computed ────────────────────
  /** Retorna `true` se existe um token válido e não expirado. */
  isAuthenticated: () => boolean;
  /** Retorna `true` se a sessão expirou. */
  isSessionExpired: () => boolean;

  // ─── Ações ───────────────────────
  /** Armazena os dados de autenticação (login/cadastro). */
  setAuth: (session: AuthSession) => void;
  /** Limpa todos os dados de autenticação (logout). */
  clearAuth: () => void;
  /** Atualiza parcialmente os dados do usuário. */
  updateUser: (partial: Partial<AuthUser>) => void;
  setHasHydrated: (value: boolean) => void;
}

// ─── Estado inicial ──────────────────────────────────────────────

const INITIAL_STATE = {
  token: null as string | null,
  profile: null as Profile | null,
  user: null as AuthUser | null,
  expiresAt: null as number | null,
  hasHydrated: false,
};

// ─── Store ───────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    logger(
      (set, get) => ({
        ...INITIAL_STATE,

        // Computed
        isAuthenticated: () => {
          const { token, expiresAt } = get();
          if (!token) return false;
          if (expiresAt !== null && Date.now() > expiresAt) return false;
          return true;
        },

        isSessionExpired: () => {
          const { expiresAt } = get();
          if (expiresAt === null) return false;
          return Date.now() > expiresAt;
        },

        // Ações
        setAuth: (session) =>
          set({
            token: session.token,
            profile: session.profile,
            user: session.user ?? null,
            // Usa o expiresAt do backend se disponível; caso contrário aplica a duração padrão.
            expiresAt: session.expiresAt ?? Date.now() + SESSION_DURATION_MS,
          }),

        clearAuth: () => set((state) => ({
          ...INITIAL_STATE,
          hasHydrated: state.hasHydrated,
        })),

        setHasHydrated: (value) => set({ hasHydrated: value }),

        updateUser: (partial) => {
          const current = get().user;
          if (!current) return;
          set({ user: { ...current, ...partial } });
        },
      }),
      "AuthStore",
    ),
    {
      name: "solum-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.token === "dev") {
          state.clearAuth();
        }
        state?.setHasHydrated(true);
      },
      /**
       * Persiste apenas dados de sessão — as funções (ações/computeds)
       * são recriadas pelo Zustand na reidratação.
       */
      partialize: (state) => ({
        token: state.token,
        profile: state.profile,
        user: state.user,
        expiresAt: state.expiresAt,
      }),
    },
  ),
);

// ─── Selectors otimizados ────────────────────────────────────────
//
// Selectors pré-definidos para uso em componentes. Cada um retorna
// apenas a fatia necessária, evitando re-renderizações desnecessárias.
//
// Uso:
//   const token = useAuthStore(selectToken);
//   const user  = useAuthStore(selectUser);

export const selectToken = (s: AuthState) => s.token;
export const selectProfile = (s: AuthState) => s.profile;
export const selectUser = (s: AuthState) => s.user;
export const selectExpiresAt = (s: AuthState) => s.expiresAt;
export const selectSetAuth = (s: AuthState) => s.setAuth;
export const selectClearAuth = (s: AuthState) => s.clearAuth;
