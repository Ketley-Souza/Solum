import { create } from "zustand";
import { offerService } from "../services/offerService";
import type { BackendOffer, NewBackendOffer, OfferStatus } from "../services/offerService";
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

export interface OfferState {
  // ─── Slices assíncronos ──────────
  /** Ofertas ativas do marketplace (rota pública). */
  marketplace: AsyncSlice<BackendOffer[]>;
  /** Ofertas do produtor logado (todas os status). */
  myOffers: AsyncSlice<BackendOffer[]>;

  // ─── Ações assíncronas ───────────
  /** Busca ofertas ativas no marketplace. Respeita cache se `force = false`. */
  fetchMarketplace: (force?: boolean) => Promise<void>;
  /** Busca ofertas do produtor logado. Respeita cache se `force = false`. */
  fetchMyOffers: (force?: boolean) => Promise<void>;
  /** Cria uma nova oferta e atualiza a lista do produtor. */
  createOffer: (data: NewBackendOffer) => Promise<BackendOffer>;
  /** Altera o status de uma oferta e atualiza as listas locais. */
  changeOfferStatus: (id: string, status: OfferStatus) => Promise<void>;

  // ─── Ações síncronas ─────────────
  /** Limpa completamente o estado (logout, troca de perfil). */
  reset: () => void;
}

// ─── Estado inicial ──────────────────────────────────────────────

const INITIAL_STATE = {
  marketplace: createAsyncSlice<BackendOffer[]>([]),
  myOffers: createAsyncSlice<BackendOffer[]>([]),
};

// ─── Store ───────────────────────────────────────────────────────

export const useOfferStore = create<OfferState>()(
  logger(
    (set, get) => ({
      ...INITIAL_STATE,

      // ─── Marketplace ─────────────────────────────────────────
      fetchMarketplace: async (force = false) => {
        const current = get().marketplace;
        if (!force && isFresh(current)) return;

        set({ marketplace: setLoading(current) });

        try {
          const data = await offerService.listActive();
          set({ marketplace: setData(get().marketplace, data) });
        } catch (err) {
          set({
            marketplace: setError(
              get().marketplace,
              err instanceof Error ? err.message : "Erro ao buscar ofertas.",
            ),
          });
        }
      },

      // ─── Ofertas do produtor ─────────────────────────────────
      fetchMyOffers: async (force = false) => {
        const current = get().myOffers;
        if (!force && isFresh(current)) return;

        set({ myOffers: setLoading(current) });

        try {
          const data = await offerService.listMine();
          set({ myOffers: setData(get().myOffers, data) });
        } catch (err) {
          set({
            myOffers: setError(
              get().myOffers,
              err instanceof Error ? err.message : "Erro ao buscar suas ofertas.",
            ),
          });
        }
      },

      // ─── Criar oferta ───────────────────────────────────────
      createOffer: async (data) => {
        const created = await offerService.create(data);

        // Atualiza lista local sem refetch
        set((state) => ({
          myOffers: setData(state.myOffers, [created, ...state.myOffers.data]),
        }));

        return created;
      },

      // ─── Alterar status ──────────────────────────────────────
      changeOfferStatus: async (id, status) => {
        await offerService.changeStatus(id, status);

        // Atualiza localmente ambas as listas (marketplace + minhas)
        const updateList = (list: BackendOffer[]) =>
          list.map((offer) => (offer.id === id ? { ...offer, status } : offer));

        set((state) => ({
          myOffers: setData(state.myOffers, updateList(state.myOffers.data)),
          marketplace: setData(state.marketplace, updateList(state.marketplace.data)),
        }));
      },

      // ─── Reset ───────────────────────────────────────────────
      reset: () => set({ ...INITIAL_STATE }),
    }),
    "OfferStore",
  ),
);

// ─── Selectors otimizados ────────────────────────────────────────

export const selectMarketplaceOffers = (s: OfferState) => s.marketplace.data;
export const selectMarketplaceLoading = (s: OfferState) => s.marketplace.isLoading;
export const selectMarketplaceError = (s: OfferState) => s.marketplace.error;

export const selectMyOffers = (s: OfferState) => s.myOffers.data;
export const selectMyOffersLoading = (s: OfferState) => s.myOffers.isLoading;
export const selectMyOffersError = (s: OfferState) => s.myOffers.error;

/** Selector para ofertas filtradas por status (uso com useMemo no componente). */
export const selectMyOffersByStatus = (status: OfferStatus) => (s: OfferState) =>
  s.myOffers.data.filter((o) => o.status === status);
