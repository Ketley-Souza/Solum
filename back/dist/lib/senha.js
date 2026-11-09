import { hash, verify, argon2id } from 'argon2';
// RNF01 — senhas persistidas apenas como hash argon2id
export function gerarHashSenha(senha) {
    return hash(senha, { type: argon2id });
}
export function verificarSenha(senhaHash, senha) {
    return verify(senhaHash, senha);
}
