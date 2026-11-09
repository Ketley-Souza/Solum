import { useCallback } from "react";
import { useAuthStore } from "./authStore";
import { useOfferStore } from "./offerStore";
import { useOrderStore } from "./orderStore";
import { useFreightStore } from "./freightStore";

/**
 * Hook que retorna uma função para limpar TODAS as stores
 * de uma vez. Ideal para uso no fluxo de logout.
 *
 * @example
 * ```tsx
 * function LogoutButton() {
 *   const resetAll = useResetAllStores();
 *   const navigate = useNavigate();
 *
 *   const handleLogout = () => {
 *     resetAll();
 *     navigate("/login", { replace: true });
 *   };
 *
 *   return <button onClick={handleLogout}>Sair</button>;
 * }
 * ```
 */
export function useResetAllStores() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const resetOffers = useOfferStore((s) => s.reset);
  const resetOrders = useOrderStore((s) => s.reset);
  const resetFreights = useFreightStore((s) => s.reset);

  return useCallback(() => {
    clearAuth();
    resetOffers();
    resetOrders();
    resetFreights();
  }, [clearAuth, resetOffers, resetOrders, resetFreights]);
}

/**
 * Versão imperativa (fora de componentes React).
 * Útil em interceptors HTTP ou guards de rota.
 */
export function resetAllStores() {
  useAuthStore.getState().clearAuth();
  useOfferStore.getState().reset();
  useOrderStore.getState().reset();
  useFreightStore.getState().reset();
}
