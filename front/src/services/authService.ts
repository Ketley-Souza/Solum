import type { CadastroPayload, LoginPayload, Profile } from "../types/auth";
import { requestJson } from "./http";

/** Resposta bruta do backend no login/cadastro */
interface BackendLoginResponse {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    whatsapp?: string;
    perfil: string; // ex.: "PRODUTOR"
  };
}

/** Sessão normalizada — o que o authStore espera */
export interface AuthResponse {
  token: string;
  profile: Profile;
  user: { id: string; name: string; email: string; whatsapp?: string };
}

/** Perfil do front (lowercase) → enum do back (UPPERCASE) */
const PERFIL_MAP: Record<Profile, string> = {
  produtor: "PRODUTOR",
  comprador: "COMPRADOR",
  transportador: "TRANSPORTADOR",
};

async function login(payload: LoginPayload): Promise<AuthResponse> {
  // Back espera: { email, senha } — sem perfil (já está na conta)
  const raw = await requestJson<BackendLoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: payload.email.trim().toLowerCase(), senha: payload.password }),
  });
  const profile = raw.usuario.perfil.toLowerCase() as Profile;
  if (profile !== payload.profile) {
    throw new Error(`Este e-mail pertence a uma conta de ${profile}. Selecione esse perfil para entrar.`);
  }

  return {
    token: raw.token,
    profile,
    user: { id: raw.usuario.id, name: raw.usuario.nome, email: raw.usuario.email, whatsapp: raw.usuario.whatsapp },
  };
}

async function cadastro(payload: CadastroPayload): Promise<AuthResponse> {
  // Back espera: { nome, documento, email, whatsapp, senha, perfil (UPPERCASE) }
  await requestJson("/auth/cadastro", {
    method: "POST",
    body: JSON.stringify({
      nome: payload.nome,
      documento: payload.documento.replace(/\D/g, ""),
      email: payload.email.trim().toLowerCase(),
      whatsapp: payload.whatsapp,
      senha: payload.password,
      perfil: PERFIL_MAP[payload.profile],
    }),
  });
  // Back não retorna token no cadastro → login automático pós-registro
  return login({ profile: payload.profile, email: payload.email.trim(), password: payload.password });
}

export const authService = { login, cadastro };
