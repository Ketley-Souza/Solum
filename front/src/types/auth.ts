export type Profile = "produtor" | "comprador" | "transportador";

export type AuthMode = "entrar" | "criar";

export interface LoginPayload {
  profile: Profile;
  email: string;
  password: string;
}

export interface CadastroPayload {
  profile: Profile;
  nome: string;
  documento: string;
  email: string;
  whatsapp: string;
  password: string;
}
