import { Prisma } from '../generated/prisma/client.js'
import { PerfilUsuario, StatusUsuario, TipoReferencia } from '../generated/prisma/enums.js'
import type { UsuarioAutenticado } from '../middlewares/autenticar.js'
import { prisma } from '../lib/prisma.js'
import { NotFoundError } from '../errors.js'

const SELECAO_NOTIFICACAO = {
  id: true,
  titulo: true,
  mensagem: true,
  lida: true,
  tipo_referencia: true,
  referencia_id: true,
  criado_em: true,
} satisfies Prisma.NotificacaoSelect

export async function listarNotificacoes(ator: UsuarioAutenticado) {
  return prisma.notificacao.findMany({
    where: { usuario_id: ator.id, excluido_em: null },
    orderBy: { criado_em: 'desc' },
    select: SELECAO_NOTIFICACAO,
  })
}

/** Cria uma notificação por destinatário. Chamar com `tx` para ser atômico com o evento de origem. */
export async function notificarUsuarios(
  db: Prisma.TransactionClient,
  usuarioIds: string[],
  notificacao: { titulo: string; mensagem: string; tipo_referencia: TipoReferencia; referencia_id: string },
) {
  const destinatarios = [...new Set(usuarioIds)]
  if (destinatarios.length === 0) return
  await db.notificacao.createMany({
    data: destinatarios.map((usuario_id) => ({ usuario_id, ...notificacao })),
  })
}

export async function notificarTransportadoresNovoFrete(
  tx: Prisma.TransactionClient,
  frete: { id: string; codigo: string; endereco_origem: string; endereco_destino: string },
) {
  const transportadores = await tx.usuario.findMany({
    where: { perfil: PerfilUsuario.TRANSPORTADOR, status: StatusUsuario.ATIVO, excluido_em: null },
    select: { id: true },
  })
  await notificarUsuarios(tx, transportadores.map(({ id }) => id), {
    titulo: `Novo frete disponível ${frete.codigo}`,
    mensagem: `De ${frete.endereco_origem} para ${frete.endereco_destino}.`,
    tipo_referencia: TipoReferencia.FRETE,
    referencia_id: frete.id,
  })
}

export async function notificarNovaOferta(oferta: {
  id: string
  produto: string
  categoria: string
  preco: Prisma.Decimal
  unidade: string
}) {
  const compradores = await prisma.usuario.findMany({
    where: {
      perfil: PerfilUsuario.COMPRADOR,
      status: StatusUsuario.ATIVO,
      excluido_em: null,
    },
    select: { id: true },
  })

  if (compradores.length === 0) return

  await prisma.notificacao.createMany({
    data: compradores.map(({ id }) => ({
      usuario_id: id,
      titulo: `Nova oferta de ${oferta.produto}`,
      mensagem: `${oferta.categoria} disponível por R$ ${oferta.preco.toFixed(2)}/${oferta.unidade}.`,
      tipo_referencia: TipoReferencia.OFERTA,
      referencia_id: oferta.id,
    })),
  })
}

export async function marcarNotificacaoComoLida(ator: UsuarioAutenticado, id: string) {
  const resultado = await prisma.notificacao.updateMany({
    where: { id, usuario_id: ator.id, excluido_em: null },
    data: { lida: true },
  })
  if (resultado.count === 0) throw new NotFoundError('Notificação não encontrada')
}

export async function marcarTodasNotificacoesComoLidas(ator: UsuarioAutenticado) {
  await prisma.notificacao.updateMany({
    where: { usuario_id: ator.id, excluido_em: null, lida: false },
    data: { lida: true },
  })
}
