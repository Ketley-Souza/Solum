import { useAuthStore } from "../stores/authStore";
import { requestJson } from "./http";

export type NotificationReference = "OFERTA" | "PROPOSTA" | "CONTRA_PROPOSTA" | "PEDIDO" | "FRETE" | null;

export interface BackendNotification {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  tipo_referencia: NotificationReference;
  referencia_id: string | null;
  criado_em: string;
}

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("Entre com uma conta para carregar as notificações.");
  return { Authorization: `Bearer ${token}` };
}

export const notificationService = {
  list(): Promise<BackendNotification[]> {
    return requestJson<BackendNotification[]>("/notificacoes", { headers: authHeaders() });
  },
  markRead(id: string): Promise<void> {
    return requestJson<void>(`/notificacoes/${encodeURIComponent(id)}/lida`, { method: "PATCH", headers: authHeaders() });
  },
  markAllRead(): Promise<void> {
    return requestJson<void>("/notificacoes/todas/lidas", { method: "PATCH", headers: authHeaders() });
  },
};
