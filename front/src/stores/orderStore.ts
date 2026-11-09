import { create } from "zustand";
import { orderService } from "../services/orderService";
import type { BackendOrder, OrderStatus } from "../services/orderService";
import { logger } from "./middleware";
import {
  type AsyncSlice,
  createAsyncSlice,
  setLoading,
  setData,
  setError,
  isFresh,
} from "./types";

// ─── Tipos ───────────────────────────────────────────────────────

export interface OrderState {
  // ─── Slices assíncronos ──────────
  /** Lista de pedidos do usuário logado (comprador ou produtor). */
  orders: AsyncSlice<BackendOrder[]>;

  // ─── Ações assíncronas ───────────
  /** Busca pedidos. Respeita cache se `force = false`. */
  fetchOrders: (force?: boolean) => Promise<void>;

  // ─── Ações síncronas ─────────────
  /**
   * Atualiza um pedido localmente (ex: após ação do websocket ou
   * resposta de mutação). Evita refetch completo da lista.
   */
  updateOrderLocally: (id: string, partial: Partial<BackendOrder>) => void;
  /** Limpa completamente o estado (logout, troca de perfil). */
  reset: () => void;
}

// ─── Estado inicial ──────────────────────────────────────────────

const INITIAL_STATE = {
  orders: createAsyncSlice<BackendOrder[]>([]),
};

// ─── Store ───────────────────────────────────────────────────────

export const useOrderStore = create<OrderState>()(
  logger(
    (set, get) => ({
      ...INITIAL_STATE,

      fetchOrders: async (force = false) => {
        const current = get().orders;
        if (!force && isFresh(current)) return;

        set({ orders: setLoading(current) });

        try {
          const data = await orderService.list();
          set({ orders: setData(get().orders, data) });
        } catch (err) {
          set({
            orders: setError(
              get().orders,
              err instanceof Error ? err.message : "Erro ao buscar pedidos.",
            ),
          });
        }
      },

      updateOrderLocally: (id, partial) => {
        set((state) => ({
          orders: setData(
            state.orders,
            state.orders.data.map((order) =>
              order.id === id ? { ...order, ...partial } : order,
            ),
          ),
        }));
      },

      reset: () => set({ ...INITIAL_STATE }),
    }),
    "OrderStore",
  ),
);

// ─── Selectors otimizados ────────────────────────────────────────

export const selectOrders = (s: OrderState) => s.orders.data;
export const selectOrdersLoading = (s: OrderState) => s.orders.isLoading;
export const selectOrdersError = (s: OrderState) => s.orders.error;

/** Selector por status — ex: `selectOrdersByStatus("ABERTO")`. */
export const selectOrdersByStatus = (status: OrderStatus) => (s: OrderState) =>
  s.orders.data.filter((o) => o.status === status);

/** Selector para um pedido específico por ID. */
export const selectOrderById = (id: string) => (s: OrderState) =>
  s.orders.data.find((o) => o.id === id) ?? null;
