import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

/**
 * ProtectedRoute
 *
 * Valida:
 * 1. Se o token existe no store (persistido via zustand/persist).
 * 2. Se a sessão não expirou (campo `expiresAt` no store).
 *
 * Se qualquer verificação falhar o usuário é redirecionado para /login
 * preservando a rota original em `state.from` para redirect pós-login.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const expiresAt = useAuthStore((s) => s.expiresAt);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const location = useLocation();

  // Verifica expiração sem re-render desnecessário
  const isExpired = expiresAt !== null && Date.now() > expiresAt;
  const clearedRef = useRef(false);

  useEffect(() => {
    if (isExpired && !clearedRef.current) {
      clearedRef.current = true;
      clearAuth();
    }
  }, [isExpired, clearAuth]);

  // ⚠️  DEV ONLY — bypassa autenticação em desenvolvimento.
  //    Removido automaticamente pelo Vite no build de produção.
  if (import.meta.env.DEV) return <>{children}</>;

  if (!token || isExpired) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <>{children}</>;
}
