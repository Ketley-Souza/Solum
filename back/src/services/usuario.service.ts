import { Prisma } from '../generated/prisma/client.js'
import { PerfilUsuario, StatusUsuario } from '../generated/prisma/enums.js'
import type { UsuarioAutenticado } from '../middlewares/autenticar.js'
import { prisma } from '../lib/prisma.js'
import { gerarHashSenha, verificarSenha } from '../lib/senha.js'
import { gerarToken } from '../lib/token.js'
import { AppError, ForbiddenError, NotFoundError, UnauthorizedError } from '../errors.js'
import { exigirPerfil } from './comum.js'

/** RNF01/RNF07 — nunca retorna senha_hash nem documento. */
const SELECAO_SEGURA = {
  id: true,
  nome: true,
  email: true,
  whatsapp: true,
  perfil: true,
  status: true,
  criado_em: true,
} satisfies Prisma.UsuarioSelect

export type UsuarioSeguro = Prisma.UsuarioGetPayload<{ select: typeof SELECAO_SEGURA }>

const PERFIS_AUTOCADASTRO: readonly PerfilUsuario[] = [
  PerfilUsuario.PRODUTOR,
  PerfilUsuario.COMPRADOR,
  PerfilUsuario.TRANSPORTADOR,
]

export type DadosCadastroUsuario = {
  nome: string
  documento: string
  whatsapp: string
  email: string
  senha: string
  perfil: PerfilUsuario
}

export async function cadastrarUsuario(dados: DadosCadastroUsuario): Promise<UsuarioSeguro> {
  if (!PERFIS_AUTOCADASTRO.includes(dados.perfil)) {
    throw new ForbiddenError('Perfil não permitido no autocadastro')
  }
  const senha_hash = await gerarHashSenha(dados.senha)
  return prisma.usuario.create({
    data: {
      nome: dados.nome,
      documento: dados.documento,
      whatsapp: dados.whatsapp,
      email: dados.email.toLowerCase(),
      senha_hash,
      perfil: dados.perfil,
    },
    select: SELECAO_SEGURA,
  })
}

export async function autenticarUsuario(
  email: string,
  senha: string,
): Promise<{ token: string; usuario: UsuarioSeguro }> {
  const usuario = await prisma.usuario.findFirst({
    where: { email: email.toLowerCase(), excluido_em: null },
    select: { ...SELECAO_SEGURA, senha_hash: true },
  })
  if (!usuario || !(await verificarSenha(usuario.senha_hash, senha))) {
    throw new UnauthorizedError('Credenciais inválidas')
  }
  if (usuario.status === StatusUsuario.SUSPENSO) throw new ForbiddenError('Conta suspensa')

  const { senha_hash: _omitido, ...seguro } = usuario
  return { token: gerarToken({ id: seguro.id, perfil: seguro.perfil, email: seguro.email }), usuario: seguro }
}

/** RN09 — suspensão/reativação exclusiva do ADMINISTRADOR. */
export async function alterarStatusUsuario(
  ator: UsuarioAutenticado,
  usuarioId: string,
  status: StatusUsuario,
): Promise<UsuarioSeguro> {
  exigirPerfil(ator, PerfilUsuario.ADMINISTRADOR)
  if (usuarioId === ator.id) throw new AppError('Administrador não pode alterar o próprio status', 422)

  const alvo = await prisma.usuario.findFirst({ where: { id: usuarioId, excluido_em: null }, select: { id: true } })
  if (!alvo) throw new NotFoundError('Usuário não encontrado')

  return prisma.usuario.update({ where: { id: usuarioId }, data: { status }, select: SELECAO_SEGURA })
}
