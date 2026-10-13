import { requestJson } from "./http";

export interface Offer {
  id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  availableQuantity?: number;
}

export const offerService = {
  list(): Promise<Offer[]> {
    return requestJson<Offer[]>("/offers");
  },
  getById(id: string): Promise<Offer> {
    return requestJson<Offer>(`/offers/${encodeURIComponent(id)}`);
  },
};
