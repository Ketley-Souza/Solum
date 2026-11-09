/**
 * ┌──────────────────────────────────────────────────────────────┐
 * │  SOLUM — Stores (Gerenciamento de Estado Global)            │
 * │                                                              │
 * │  Barrel export que centraliza todos os stores da aplicação. │
 * │  Importe sempre a partir deste arquivo:                     │
 * │                                                              │
 * │    import { useAuthStore, selectUser } from "../stores";    │
 * │    import { useOfferStore } from "../stores";               │
 * │                                                              │
 * │  Arquitetura:                                                │
 * │  ├── authStore    → Autenticação, sessão, perfil            │
 * │  ├── offerStore   → Ofertas marketplace e do produtor       │
 * │  ├── orderStore   → Pedidos do comprador e produtor         │
 * │  ├── freightStore → Fretes, veículos, operações de logística│
 * │  ├── hooks        → useResetAllStores, resetAllStores      │
 * │  ├── types        → AsyncSlice, helpers de estado assíncrono│
 * │  └── middleware/   → logger (dev logging)                   │
 * └──────────────────────────────────────────────────────────────┘
 */

// ─── Stores ──────────────────────────────────────────────────────
export { useAuthStore } from "./authStore";
export type { AuthState, AuthSession, AuthUser } from "./authStore";
export {
  selectToken,
  selectProfile,
  selectUser,
  selectExpiresAt,
  selectSetAuth,
  selectClearAuth,
} from "./authStore";

export { useOfferStore } from "./offerStore";
export type { OfferState } from "./offerStore";
export {
  selectMarketplaceOffers,
  selectMarketplaceLoading,
  selectMarketplaceError,
  selectMyOffers,
  selectMyOffersLoading,
  selectMyOffersError,
  selectMyOffersByStatus,
} from "./offerStore";

export { useOrderStore } from "./orderStore";
export type { OrderState } from "./orderStore";
export {
  selectOrders,
  selectOrdersLoading,
  selectOrdersError,
  selectOrdersByStatus,
  selectOrderById,
} from "./orderStore";

export { useFreightStore } from "./freightStore";
export type { FreightState } from "./freightStore";
export {
  selectAllFreights,
  selectFreightsLoading,
  selectFreightsError,
  selectVehicles,
  selectVehiclesLoading,
  selectAvailableFreights,
  selectFreightsByStatus,
  selectMyFreights,
  selectActiveFreights,
  selectCompletedFreights,
  selectEarnings,
} from "./freightStore";

// ─── Hooks utilitários ───────────────────────────────────────────
export { useResetAllStores, resetAllStores } from "./hooks";

// ─── Tipos compartilhados ────────────────────────────────────────
export type { AsyncSlice } from "./types";
export { createAsyncSlice, isFresh } from "./types";

// ─── Middleware ──────────────────────────────────────────────────
export { logger } from "./middleware";
