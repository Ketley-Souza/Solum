import { requestJson } from "./http";
import { useAuthStore } from "../stores/authStore";

export type FreightStatus =
  | "DISPONIVEL"
  | "ACEITO"
  | "RECUSADO"
  | "EM_ROTA"
  | "ENTREGUE";

export interface Freight {
  id: string;
  codigo: string;
  pedido_id: string;
  transportador_id: string | null;
  veiculo_id: string | null;
  endereco_origem: string;
  endereco_destino: string;
  peso_toneladas: number | string;
  valor_frete: number | string | null;
  status: FreightStatus;
  criado_em: string;
  atualizado_em: string;
  pedido?: {
    codigo?: string;
    oferta?: {
      produto?: string;
      categoria?: string;
    } | null;
  } | null;
}

export interface Vehicle {
  id: string;
  tipo_veiculo: string;
  capacidade_toneladas: number | string;
}

export interface TransportOffer {
  id: string;
  origin: string;
  destination: string;
  load: string;
  price: number;
}

/**
 * Envia o token real do usuário para o backend.
 *
 * Não aceita o token fictício "dev", pois ele
 * não é reconhecido pela autenticação do backend.
 */
function authenticatedRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = useAuthStore.getState().token;

  if (!token || token === "dev") {
    return Promise.reject(
      new Error(
        "Entre com uma conta real de transportador para acessar os fretes do banco.",
      ),
    );
  }

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);

  // Converte Headers para objeto porque o http.ts atual
  // utiliza espalhamento de propriedades no cabeçalho.
  const authHeaders: Record<string, string> = {};

  headers.forEach((value, key) => {
    authHeaders[key] = value;
  });

  return requestJson<T>(path, {
    ...init,
    headers: authHeaders,
  });
}

/**
 * Busca os fretes armazenados no banco de dados.
 */
async function listFreights(
  status?: FreightStatus,
): Promise<Freight[]> {
  const query = status
    ? `?status=${encodeURIComponent(status)}`
    : "";

  return authenticatedRequest<Freight[]>(
    `/fretes${query}`,
  );
}

/**
 * Busca os veículos cadastrados do transportador.
 */
async function listVehicles(): Promise<Vehicle[]> {
  return authenticatedRequest<Vehicle[]>(
    "/veiculos",
  );
}

/**
 * Aceita um frete utilizando um veículo real.
 */
async function acceptFreight(
  freightId: string,
  vehicleId: string,
): Promise<Freight> {
  return authenticatedRequest<Freight>(
    `/fretes/${encodeURIComponent(freightId)}/aceitar`,
    {
      method: "POST",
      body: JSON.stringify({
        veiculo_id: vehicleId,
      }),
    },
  );
}

/**
 * Altera o status de ACEITO para EM_ROTA.
 */
async function startTransport(
  freightId: string,
): Promise<Freight> {
  return authenticatedRequest<Freight>(
    `/fretes/${encodeURIComponent(freightId)}/iniciar-transporte`,
    {
      method: "PATCH",
    },
  );
}

/**
 * Confirma a entrega de um frete em transporte.
 */
async function confirmDelivery(
  freightId: string,
): Promise<Freight> {
  return authenticatedRequest<Freight>(
    `/fretes/${encodeURIComponent(freightId)}/confirmar-entrega`,
    {
      method: "PATCH",
    },
  );
}

/**
 * Mantém compatibilidade com o formato antigo
 * do transportService.
 */
async function list(): Promise<TransportOffer[]> {
  const freights = await listFreights("DISPONIVEL");

  return freights.map((freight) => ({
    id: freight.id,
    origin: freight.endereco_origem,
    destination: freight.endereco_destino,
    load: `${freight.peso_toneladas} toneladas`,
    price: Number(freight.valor_frete ?? 0),
  }));
}

/**
 * Busca um frete específico entre os retornados
 * pela API. O backend atual não possui GET
 * /fretes/:id, por isso utilizamos a listagem.
 */
async function getById(
  id: string,
): Promise<TransportOffer> {
  const freights = await listFreights();
  const freight = freights.find(
    (item) => item.id === id,
  );

  if (!freight) {
    throw new Error("Frete não encontrado.");
  }

  return {
    id: freight.id,
    origin: freight.endereco_origem,
    destination: freight.endereco_destino,
    load: `${freight.peso_toneladas} toneladas`,
    price: Number(freight.valor_frete ?? 0),
  };
}

export const transportService = {
  listFreights,
  listVehicles,
  acceptFreight,
  startTransport,
  confirmDelivery,
  list,
  getById,
};