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
    // Tenta extrair a mensagem de erro do JSON do backend (campo "erro")
    let mensagem = `Erro ${response.status}`;
    try {
      const corpo = await response.json() as { erro?: string };
      if (corpo.erro) mensagem = corpo.erro;
    } catch {
      // corpo não é JSON — mantém mensagem genérica
    }
    throw new Error(mensagem);
  }

  return response.json() as Promise<T>;
}
