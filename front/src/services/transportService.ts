import { requestJson } from "./http";

export interface TransportOffer {
  id: string;
  origin: string;
  destination: string;
  load: string;
  price: number;
}

export const transportService = {
  list(): Promise<TransportOffer[]> {
    return requestJson<TransportOffer[]>("/transports");
  },
  getById(id: string): Promise<TransportOffer> {
    return requestJson<TransportOffer>(`/transports/${encodeURIComponent(id)}`);
  },
};
