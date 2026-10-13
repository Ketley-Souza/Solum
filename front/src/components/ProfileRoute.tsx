import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import type { Profile } from "../types/auth";

interface ProfileRouteProps {
  /** Perfil que esta rota requer (ex.: "produtor"). */
  requiredProfile: Profile;
  children: React.ReactNode;
}

/**
 * ProfileRoute
 *
 * Deve ser usado *dentro* de <ProtectedRoute> (token já foi validado).
 *
 * Valida:
 * 1. Se o perfil do usuário autenticado coincide com `requiredProfile`.
 *
 * Se não coincide, redireciona o usuário para a rota do próprio perfil
 * em vez de mostrar uma 403 genérica — melhora UX e evita confusão.
 */
export function ProfileRoute({ requiredProfile, children }: ProfileRouteProps) {
  const profile = useAuthStore((s) => s.profile);
  const location = useLocation();

  // ⚠️  DEV ONLY — bypassa verificação de perfil em desenvolvimento.
  //    Removido automaticamente pelo Vite no build de produção.
  if (import.meta.env.DEV) return <>{children}</>;

  // Perfil incompatível → redireciona para a área correta do usuário.
  if (profile !== requiredProfile) {
    const destination = profile ? `/${profile}` : "/login";
    return (
      <Navigate
        to={destination}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <>{children}</>;
}
