import { Prisma, type Frete, type Pedido } from '../generated/prisma/client.js'
import { PerfilUsuario, StatusOferta, StatusPedido } from '../generated/prisma/enums.js'
import type { UsuarioAutenticado } from '../middlewares/autenticar.js'
import { prisma } from '../lib/prisma.js'
import { AppError, ConflictError, NotFoundError } from '../errors.js'
import { exigirPerfil, exigirPositivo, gerarCodigo, type ValorDecimal } from './comum.js'

type Tx = Prisma.TransactionClient

/**
 * RN08 refinada (opção b):
 * - Compra direta:  ABERTO -> FECHADO
 * - Negociação:     NEGOCIANDO (nasce com a Proposta) -> FECHADO
 * - Logística:      FECHADO -> EM_TRANSPORTE -> ENTREGUE
 */
const TRANSICOES_PEDIDO: Record<StatusPedido, readonly StatusPedido[]> = {
  [StatusPedido.ABERTO]: [StatusPedido.FECHADO],
  [StatusPedido.NEGOCIANDO]: [StatusPedido.FECHADO],
  [StatusPedido.FECHADO]: [StatusPedido.EM_TRANSPORTE],
  [StatusPedido.EM_TRANSPORTE]: [StatusPedido.ENTREGUE],
  [StatusPedido.ENTREGUE]: [],
}

type ValoresFinais = { preco_final?: Prisma.Decimal; quantidade_final?: Prisma.Decimal }

/** Atualização condicional: só transiciona se o status atual ainda for `de` (seguro sob concorrência). */
export async function transicionarPedido(
  tx: Tx,
  pedidoId: string,
  de: StatusPedido,
  para: StatusPedido,
  valores: ValoresFinais = {},
): Promise<void> {
  if (!TRANSICOES_PEDIDO[de].includes(para)) {
    throw new ConflictError(`Transição de pedido inválida: ${de} -> ${para}`)
  }
  const { count } = await tx.pedido.updateMany({
    where: { id: pedidoId, status: de, excluido_em: null },
    data: { status: para, ...valores },
  })
  if (count === 0) throw new ConflictError(`Pedido não está em ${de}`)
}

const FATOR_TONELADAS: Record<string, string> = {
  t: '1',
  ton: '1',
  tonelada: '1',
  toneladas: '1',
  kg: '0.001',
  'sacas de 60 kg': '0.06',
  saca: '0.06',
  sacas: '0.06',
}

export function converterParaToneladas(quantidade: Prisma.Decimal, unidade: string): Prisma.Decimal {
  const fator = FATOR_TONELADAS[unidade.trim().toLowerCase()]
  if (!fator) throw new AppError(`Unidade "${unidade}" sem conversão para toneladas definida`, 422)
  return exigirPositivo(quantidade.mul(fator).toDecimalPlaces(3), 'peso_toneladas')
}

/**
 * RN06 — DEVE ser chamado dentro de uma `$transaction`: fecha o pedido e emite o Frete
 * (DISPONIVEL, sem transportador/veículo). Qualquer falha desfaz ambos.
 */
export async function fecharPedidoComFrete(
  tx: Tx,
  pedidoId: string,
  de: typeof StatusPedido.ABERTO | typeof StatusPedido.NEGOCIANDO,
  valores: ValoresFinais = {},
): Promise<{ pedido: Pedido; frete: Frete }> {
  await transicionarPedido(tx, pedidoId, de, StatusPedido.FECHADO, valores)

  const { oferta, ...pedido } = await tx.pedido.findUniqueOrThrow({
    where: { id: pedidoId },
    include: { oferta: true },
  })
  if (oferta.status !== StatusOferta.ATIVA || oferta.excluido_em) {
    throw new ConflictError('Oferta não está ativa')
  }
  if (pedido.quantidade_final.gt(oferta.quantidade)) {
    throw new AppError('Quantidade do pedido excede a quantidade ofertada', 422)
  }

  const frete = await tx.frete.create({
    data: {
      codigo: gerarCodigo('FRT'),
      pedido_id: pedido.id,
      endereco_origem: oferta.localizacao,
      endereco_destino: pedido.endereco_entrega,
      peso_toneladas: converterParaToneladas(pedido.quantidade_final, oferta.unidade),
    },
  })
  return { pedido, frete }
}

export type DadosCompraDireta = {
  oferta_id: string
  quantidade: ValorDecimal
  endereco_entrega: string
}

/** Compra direta ("Compre Já"): preço do anúncio, ABERTO -> FECHADO + Frete na mesma transação. */
export async function comprarDireto(
  ator: UsuarioAutenticado,
  dados: DadosCompraDireta,
): Promise<{ pedido: Pedido; frete: Frete }> {
  exigirPerfil(ator, PerfilUsuario.COMPRADOR)
  const quantidade = exigirPositivo(dados.quantidade, 'quantidade')

  return prisma.$transaction(async (tx) => {
    const oferta = await tx.oferta.findFirst({
      where: { id: dados.oferta_id, status: StatusOferta.ATIVA, excluido_em: null },
    })
    if (!oferta) throw new NotFoundError('Oferta não encontrada ou inativa')

    const pedido = await tx.pedido.create({
      data: {
        codigo: gerarCodigo('PED'),
        oferta_id: oferta.id,
        comprador_id: ator.id,
        preco_final: oferta.preco,
        quantidade_final: quantidade,
        endereco_entrega: dados.endereco_entrega,
        status: StatusPedido.ABERTO,
      },
    })
    return fecharPedidoComFrete(tx, pedido.id, StatusPedido.ABERTO)
  })
}

export async function listarPedidos(ator: UsuarioAutenticado) {
  const where =
    ator.perfil === PerfilUsuario.COMPRADOR
      ? { comprador_id: ator.id, excluido_em: null }
      : ator.perfil === PerfilUsuario.PRODUTOR
        ? { oferta: { produtor_id: ator.id }, excluido_em: null }
        : { excluido_em: null }

  return prisma.pedido.findMany({
    where,
    include: {
      oferta: { include: { produtor: { select: { nome: true } } } },
      comprador: { select: { nome: true } },
      frete: true,
    },
    orderBy: { criado_em: 'desc' },
  })
}

