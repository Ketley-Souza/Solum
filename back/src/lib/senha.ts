import { hash, verify, argon2id } from 'argon2'

// RNF01 — senhas persistidas apenas como hash argon2id
export function gerarHashSenha(senha: string): Promise<string> {
  return hash(senha, { type: argon2id })
}

export function verificarSenha(senhaHash: string, senha: string): Promise<boolean> {
  return verify(senhaHash, senha)
}
