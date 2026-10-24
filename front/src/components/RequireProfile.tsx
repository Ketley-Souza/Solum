import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import type { Profile } from "../types/auth";

// Fonte única da "home" de cada perfil (usada no login e no guard).
export const PROFILE_HOME: Record<Profile, string> = {
  produtor: "/produtor",
  comprador: "/comprador",
  transportador: "/transportador",
};

/**
 * Guarda de rota (substitui ProtectedRoute + ProfileRoute).
 * Usa só os campos que o authStore já tem: token, profile e expiresAt.
 */
export function RequireProfile({ profile: required }: { profile: Profile }) {
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const profile = useAuthStore((s) => s.profile);
  const expiresAt = useAuthStore((s) => s.expiresAt);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const expired = expiresAt !== null && expiresAt <= Date.now();
  const isAuthenticated = !!token && !!profile && !expired;

  // Sessão vencida: limpa o store (efeito colateral fora do render).
  useEffect(() => {
    if (expired) clearAuth();
  }, [expired, clearAuth]);

  // Sem sessão válida: vai para o login e guarda de onde veio.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logado, mas no perfil errado: manda para a home do perfil dele.
  if (profile !== required) {
    return <Navigate to={PROFILE_HOME[profile]} replace />;
  }

  return <Outlet />;
}
