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

function authHeaders(): Record<string, string> | null {
  const token = useAuthStore.getState().token;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

export const notificationService = {
  list(): Promise<BackendNotification[]> {
    const headers = authHeaders();
    if (!headers) return Promise.resolve([]);
    return requestJson<BackendNotification[]>("/notificacoes", { headers });
  },
  markRead(id: string): Promise<void> {
    const headers = authHeaders();
    if (!headers) return Promise.reject(new Error("Entre com uma conta para marcar notificações."));
    return requestJson<void>(`/notificacoes/${encodeURIComponent(id)}/lida`, { method: "PATCH", headers });
  },
  markAllRead(): Promise<void> {
    const headers = authHeaders();
    if (!headers) return Promise.reject(new Error("Entre com uma conta para marcar notificações."));
    return requestJson<void>("/notificacoes/todas/lidas", { method: "PATCH", headers });
  },
};
