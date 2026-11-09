import { resetAllStores } from "../stores/hooks";

const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let mensagem = `Erro ${response.status}`;
    try {
      const corpo = await response.json() as {
        erro?: string;
        detalhes?: Array<{ campo?: string; mensagem?: string }>;
      };
      if (corpo.erro) {
        const detalhe = corpo.detalhes?.[0]?.mensagem;
        mensagem = detalhe ? `${corpo.erro}: ${detalhe}` : corpo.erro;
      }
    } catch {
      // Mantém a mensagem HTTP quando o servidor não retorna JSON.
    }

    if (response.status === 401) {
      resetAllStores();
    }
    throw new Error(mensagem);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
