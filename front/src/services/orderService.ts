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
  proposta?: {
    id: string;
    preco: number | string;
    quantidade: number | string;
    status: "PENDENTE" | "ACEITA" | "RECUSADA" | "CONTRAPROPOSTA";
    criado_em: string;
    contrapropostas: Array<{
      id: string;
      preco_contraproposta: number | string;
      quantidade_contraproposta: number | string;
      mensagem?: string | null;
      status: "PENDENTE" | "ACEITA" | "RECUSADA" | "EXPIRADA";
      expira_em: string;
      criado_em: string;
    }>;
  } | null;
  oferta: {
    produto: string;
    unidade: string;
    localizacao: string;
    imagem_url?: string | null;
    produtor?: { nome: string } | null;
  };
  frete?: {
    codigo: string;
    status: string;
    peso_toneladas: number | string;
    endereco_origem: string;
    endereco_destino: string;
    criado_em: string;
    atualizado_em: string;
    transportador?: { nome: string; whatsapp: string } | null;
    veiculo?: { tipo_veiculo: string; capacidade_toneladas: number | string } | null;
  } | null;
}

/** Lista os pedidos do usuário logado (o back filtra por comprador ou produtor). */
function list(): Promise<BackendOrder[]> {
  const token = useAuthStore.getState().token;
  if (!token) {
    return Promise.reject(new Error("Entre com uma conta para ver seus pedidos."));
  }
  return requestJson<BackendOrder[]>("/pedidos", { headers: { Authorization: `Bearer ${token}` } });
}

export const orderService = { list };
