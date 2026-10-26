import { requestJson } from "./http";
import { useAuthStore } from "../stores/authStore";

export type OrderStatus = "ABERTO" | "NEGOCIANDO" | "FECHADO" | "EM_TRANSPORTE" | "ENTREGUE";

export interface BackendOrder {
  id: string;
  codigo: string;
  preco_final: number | string;
  quantidade_final: number | string;
  endereco_entrega: string;
  status: OrderStatus;
  criado_em: string;
  atualizado_em: string;
  comprador?: { nome: string } | null;
  oferta: {
    produto: string;
    unidade: string;
    localizacao: string;
    imagem_url?: string | null;
    produtor?: { nome: string } | null;
  };
  frete?: { status: string; peso_toneladas: number | string } | null;
}

/** Lista os pedidos do usuário logado (o back filtra por comprador ou produtor). */
function list(): Promise<BackendOrder[]> {
  const token = useAuthStore.getState().token;
  if (!token || token === "dev") {
    return Promise.reject(new Error("Entre com uma conta real para ver seus pedidos."));
  }
  return requestJson<BackendOrder[]>("/pedidos", { headers: { Authorization: `Bearer ${token}` } });
}

export const orderService = { list };
