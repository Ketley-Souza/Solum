import type { Profile } from "../types/auth";
import { requestJson } from "./http";
import { useAuthStore } from "../stores/authStore";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile: Profile;
  whatsapp: string;
}

interface BackendUserProfile extends Omit<UserProfile, "name" | "profile"> {
  nome: string;
  perfil: string;
}

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("Entre com uma conta para editar o perfil.");
  return { Authorization: `Bearer ${token}` };
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const user = await requestJson<BackendUserProfile>("/usuarios/me", { headers: authHeaders() });
    return { ...user, name: user.nome, profile: user.perfil.toLowerCase() as Profile };
  },
  async updateProfile(data: Pick<UserProfile, "name" | "email" | "whatsapp">): Promise<UserProfile> {
    const user = await requestJson<BackendUserProfile>("/usuarios/me", {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ nome: data.name, email: data.email, whatsapp: data.whatsapp }),
    });
    return { ...user, name: user.nome, profile: user.perfil.toLowerCase() as Profile };
  },
  getById(id: string): Promise<UserProfile> {
    return requestJson<UserProfile>(`/users/${encodeURIComponent(id)}`);
  },
};
