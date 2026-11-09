import { requestJson } from "./http";
import { useAuthStore } from "../stores/authStore";

export type ProposalStatus = "PENDENTE" | "ACEITA" | "RECUSADA" | "CONTRAPROPOSTA";

export interface BackendCounterProposal {
  id: string;
  preco_contraproposta: number | string;
  quantidade_contraproposta: number | string;
  mensagem?: string | null;
  status: "PENDENTE" | "ACEITA" | "RECUSADA" | "EXPIRADA";
  expira_em: string;
  criado_em: string;
}

export interface BackendProposal {
  id: string;
  quantidade: number | string;
  preco: number | string;
  status: ProposalStatus;
  criado_em: string;
  atualizado_em: string;
  oferta: {
    id: string;
    produto: string;
    quantidade: number | string;
    unidade: string;
    preco: number | string;
    localizacao: string;
  };
  comprador: { id: string; nome: string; whatsapp: string };
  contrapropostas: BackendCounterProposal[];
  pedido?: { id: string; status: string; criado_em: string } | null;
}

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw new Error("Entre com uma conta para consultar as negociações.");
  }
  return { Authorization: `Bearer ${token}` };
}

function authed<T>(path: string, init: RequestInit = {}): Promise<T> {
  return requestJson<T>(path, { ...init, headers: authHeaders() });
}

export const proposalService = {
  list(): Promise<BackendProposal[]> {
    return authed<BackendProposal[]>("/propostas");
  },
  accept(id: string): Promise<unknown> {
    return authed(`/propostas/${encodeURIComponent(id)}/aceitar`, { method: "POST" });
  },
  reject(id: string): Promise<unknown> {
    return authed(`/propostas/${encodeURIComponent(id)}/recusar`, { method: "POST" });
  },
  counter(
    id: string,
    data: { preco: number; quantidade: number; mensagem?: string },
  ): Promise<unknown> {
    return authed(`/propostas/${encodeURIComponent(id)}/contrapropor`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  acceptCounter(id: string): Promise<unknown> {
    return authed(`/contrapropostas/${encodeURIComponent(id)}/aceitar`, { method: "POST" });
  },
  rejectCounter(id: string): Promise<unknown> {
    return authed(`/contrapropostas/${encodeURIComponent(id)}/recusar`, { method: "POST" });
  },
};
