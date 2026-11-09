import { create } from "zustand";
import { transportService } from "../services/transportService";
import type { Freight, FreightStatus, Vehicle } from "../services/transportService";
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

export interface FreightState {
  // ─── Slices assíncronos ──────────
  /** Todos os fretes retornados pela API. */
  freights: AsyncSlice<Freight[]>;
  /** Veículos cadastrados do transportador. */
  vehicles: AsyncSlice<Vehicle[]>;

  // ─── Ações assíncronas — Leitura ─
  /** Busca todos os fretes. Respeita cache se `force = false`. */
  fetchFreights: (status?: FreightStatus, force?: boolean) => Promise<void>;
  /** Busca veículos do transportador. Respeita cache se `force = false`. */
  fetchVehicles: (force?: boolean) => Promise<void>;

  // ─── Ações assíncronas — Mutação ─
  /** Aceita um frete e atualiza a lista local. */
  acceptFreight: (freightId: string, vehicleId: string) => Promise<Freight>;
  /** Inicia o transporte (ACEITO → EM_ROTA). */
  startTransport: (freightId: string) => Promise<Freight>;
  /** Confirma a entrega (EM_ROTA → ENTREGUE). */
  confirmDelivery: (freightId: string) => Promise<Freight>;
  /** Cadastra um novo veículo na frota. */
  createVehicle: (tipo: string, capacidade: number) => Promise<Vehicle>;

  // ─── Ações síncronas ─────────────
  /** Atualiza um frete localmente (ex: via websocket). */
  updateFreightLocally: (id: string, partial: Partial<Freight>) => void;
  /** Limpa completamente o estado (logout, troca de perfil). */
  reset: () => void;
}

// ─── Estado inicial ──────────────────────────────────────────────

const INITIAL_STATE = {
  freights: createAsyncSlice<Freight[]>([]),
  vehicles: createAsyncSlice<Vehicle[]>([]),
};

// ─── Helpers internos ────────────────────────────────────────────

/** Substitui um frete na lista pelo retorno da API. */
function replaceFreight(list: Freight[], updated: Freight): Freight[] {
  return list.map((f) => (f.id === updated.id ? updated : f));
}

// ─── Store ───────────────────────────────────────────────────────

export const useFreightStore = create<FreightState>()(
  logger(
    (set, get) => ({
      ...INITIAL_STATE,

      // ─── Fetch fretes ──────────────────────────────────────────
      fetchFreights: async (status, force = false) => {
        const current = get().freights;
        if (!force && isFresh(current)) return;

        set({ freights: setLoading(current) });

        try {
          const data = await transportService.listFreights(status);
          set({ freights: setData(get().freights, data) });
        } catch (err) {
          set({
            freights: setError(
              get().freights,
              err instanceof Error ? err.message : "Erro ao buscar fretes.",
            ),
          });
        }
      },

      // ─── Fetch veículos ────────────────────────────────────────
      fetchVehicles: async (force = false) => {
        const current = get().vehicles;
        if (!force && isFresh(current)) return;

        set({ vehicles: setLoading(current) });

        try {
          const data = await transportService.listVehicles();
          set({ vehicles: setData(get().vehicles, data) });
        } catch (err) {
          set({
            vehicles: setError(
              get().vehicles,
              err instanceof Error ? err.message : "Erro ao buscar veículos.",
            ),
          });
        }
      },

      // ─── Aceitar frete ─────────────────────────────────────────
      acceptFreight: async (freightId, vehicleId) => {
        const updated = await transportService.acceptFreight(freightId, vehicleId);

        set((state) => ({
          freights: setData(state.freights, replaceFreight(state.freights.data, updated)),
        }));

        return updated;
      },

      // ─── Iniciar transporte ────────────────────────────────────
      startTransport: async (freightId) => {
        const updated = await transportService.startTransport(freightId);

        set((state) => ({
          freights: setData(state.freights, replaceFreight(state.freights.data, updated)),
        }));

        return updated;
      },

      // ─── Confirmar entrega ─────────────────────────────────────
      confirmDelivery: async (freightId) => {
        const updated = await transportService.confirmDelivery(freightId);

        set((state) => ({
          freights: setData(state.freights, replaceFreight(state.freights.data, updated)),
        }));

        return updated;
      },

      // ─── Cadastrar veículo ─────────────────────────────────────
      createVehicle: async (tipo, capacidade) => {
        const created = await transportService.createVehicle(tipo, capacidade);

        set((state) => ({
          vehicles: setData(state.vehicles, [...state.vehicles.data, created]),
        }));

        return created;
      },

      // ─── Atualização local ─────────────────────────────────────
      updateFreightLocally: (id, partial) => {
        set((state) => ({
          freights: setData(
            state.freights,
            state.freights.data.map((f) => (f.id === id ? { ...f, ...partial } : f)),
          ),
        }));
      },

      // ─── Reset ─────────────────────────────────────────────────
      reset: () => set({ ...INITIAL_STATE }),
    }),
    "FreightStore",
  ),
);

// ─── Selectors otimizados ────────────────────────────────────────

export const selectAllFreights = (s: FreightState) => s.freights.data;
export const selectFreightsLoading = (s: FreightState) => s.freights.isLoading;
export const selectFreightsError = (s: FreightState) => s.freights.error;

export const selectVehicles = (s: FreightState) => s.vehicles.data;
export const selectVehiclesLoading = (s: FreightState) => s.vehicles.isLoading;

/** Fretes disponíveis para aceitar (sem transportador atribuído). */
export const selectAvailableFreights = (s: FreightState) =>
  s.freights.data.filter((f) => f.status === "DISPONIVEL" && !f.transportador_id);

/** Fretes filtrados por status. */
export const selectFreightsByStatus = (status: FreightStatus) => (s: FreightState) =>
  s.freights.data.filter((f) => f.status === status);

/** Fretes atribuídos a um transportador específico. */
export const selectMyFreights = (userId: string | undefined) => (s: FreightState) =>
  userId ? s.freights.data.filter((f) => f.transportador_id === userId) : [];

/** Fretes ativos (ACEITO ou EM_ROTA) do transportador. */
export const selectActiveFreights = (userId: string | undefined) => (s: FreightState) =>
  userId
    ? s.freights.data.filter(
        (f) => f.transportador_id === userId && (f.status === "ACEITO" || f.status === "EM_ROTA"),
      )
    : [];

/** Fretes concluídos (ENTREGUE) do transportador. */
export const selectCompletedFreights = (userId: string | undefined) => (s: FreightState) =>
  userId ? s.freights.data.filter((f) => f.transportador_id === userId && f.status === "ENTREGUE") : [];

/** Ganhos totais dos fretes concluídos. */
export const selectEarnings = (userId: string | undefined) => (s: FreightState) => {
  if (!userId) return 0;
  return s.freights.data
    .filter((f) => f.transportador_id === userId && f.status === "ENTREGUE")
    .reduce((sum, f) => sum + Number(f.valor_frete ?? 0), 0);
};
