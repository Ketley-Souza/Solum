import { requestJson } from "./http";
import { useAuthStore } from "../stores/authStore";

export type OfferStatus = "ATIVA" | "PAUSADA" | "ENCERRADA";

/** Oferta como o back-end (GET /ofertas) devolve. */
export interface BackendOffer {
  id: string;
  produtor_id: string;
  produto: string;
  categoria: string;
  qualidade: string;
  safra: string;
  quantidade: number | string;
  unidade: string;
  preco: number | string;
  localizacao: string;
  periodo: string;
  descricao?: string | null;
  imagem_url?: string | null;
  status: OfferStatus;
  produtor?: { id: string; nome: string } | null;
}

export interface NewBackendOffer {
  produto: string;
  categoria: string;
  qualidade: string;
  safra: string;
  quantidade: number;
  unidade: string;
  preco: number;
  localizacao: string;
  periodo: string;
  descricao?: string;
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  availableQuantity?: number;
}

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  if (!token || token === "dev") {
    throw new Error("Entre com uma conta real para usar o banco de dados.");
  }
  return { Authorization: `Bearer ${token}` };
}

async function authed<T>(path: string, init: RequestInit = {}): Promise<T> {
  return requestJson<T>(path, { ...init, headers: authHeaders() });
}

export const offerService = {
  list(): Promise<Offer[]> {
    return requestJson<Offer[]>("/offers");
  },
  getById(id: string): Promise<Offer> {
    return requestJson<Offer>(`/offers/${encodeURIComponent(id)}`);
  },

  /** Ofertas ativas do marketplace (rota pública do back). */
  listActive(): Promise<BackendOffer[]> {
    return requestJson<BackendOffer[]>("/ofertas");
  },
  /** Ofertas do produtor logado (ativas, pausadas e encerradas). */
  async listMine(): Promise<BackendOffer[]> {
    const userId = useAuthStore.getState().user?.id;
    const groups = await Promise.all(
      (["ATIVA", "PAUSADA", "ENCERRADA"] as OfferStatus[]).map((status) =>
        requestJson<BackendOffer[]>(`/ofertas?status=${status}`),
      ),
    );
    return groups.flat().filter((offer) => offer.produtor_id === userId);
  },
  create(data: NewBackendOffer): Promise<BackendOffer> {
    return authed<BackendOffer>("/ofertas", { method: "POST", body: JSON.stringify(data) });
  },
  changeStatus(id: string, status: OfferStatus): Promise<unknown> {
    return authed(`/ofertas/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  /** Compra direta: grava o pedido (e o frete) no banco. */
  buyNow(data: { oferta_id: string; quantidade: number; endereco_entrega: string }): Promise<unknown> {
    return authed("/pedidos/compra-direta", { method: "POST", body: JSON.stringify(data) });
  },
  /** Proposta de negociação gravada no banco. */
  propose(data: {
    oferta_id: string;
    quantidade: number;
    preco: number;
    endereco_entrega: string;
  }): Promise<unknown> {
    return authed("/propostas", { method: "POST", body: JSON.stringify(data) });
  },
};
