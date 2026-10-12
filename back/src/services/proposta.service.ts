import { Prisma, type ContraProposta, type Frete, type Pedido, type Proposta } from '../generated/prisma/client.js'
import {
  PerfilUsuario,
  StatusContraProposta,
  StatusOferta,
  StatusPedido,
  StatusProposta,
} from '../generated/prisma/enums.js'
import type { UsuarioAutenticado } from '../middlewares/autenticar.js'
import { prisma } from '../lib/prisma.js'
import { AppError, ConflictError, NotFoundError } from '../errors.js'
import { exigirPerfil, exigirPositivo, gerarCodigo, type ValorDecimal } from './comum.js'
import { fecharPedidoComFrete } from './pedido.service.js'

type Tx = Prisma.TransactionClient

/** Negociação encerrada sem acordo: o Pedido NEGOCIANDO é arquivado via soft-delete (RN11). */
async function arquivarPedidoNegociado(tx: Tx, propostaId: string): Promise<void> {
  await tx.pedido.updateMany({
    where: { proposta_id: propostaId, status: StatusPedido.NEGOCIANDO, excluido_em: null },
    data: { excluido_em: new Date() },
  })
}

async function pedidoDaProposta(tx: Tx, propostaId: string): Promise<Pedido> {
  const pedido = await tx.pedido.findFirst({ where: { proposta_id: propostaId, excluido_em: null } })
  if (!pedido) throw new NotFoundError('Pedido da proposta não encontrado')
  return pedido
}

// ------------------------------------------------------------------ Comprador

export type DadosProposta = {
  oferta_id: string
  quantidade: ValorDecimal
  preco: ValorDecimal
  endereco_entrega: string
}

/** Opção (b): a Proposta nasce junto com o Pedido em NEGOCIANDO. */
export async function criarProposta(
  ator: UsuarioAutenticado,
  dados: DadosProposta,
): Promise<{ proposta: Proposta; pedido: Pedido }> {
  exigirPerfil(ator, PerfilUsuario.COMPRADOR)
  const quantidade = exigirPositivo(dados.quantidade, 'quantidade')
  const preco = exigirPositivo(dados.preco, 'preco')

  return prisma.$transaction(async (tx) => {
    const oferta = await tx.oferta.findFirst({
      where: { id: dados.oferta_id, status: StatusOferta.ATIVA, excluido_em: null },
    })
    if (!oferta) throw new NotFoundError('Oferta não encontrada ou inativa')
    if (quantidade.gt(oferta.quantidade)) throw new AppError('Quantidade excede a quantidade ofertada', 422)

    const proposta = await tx.proposta.create({
      data: { oferta_id: oferta.id, comprador_id: ator.id, quantidade, preco },
    })
    const pedido = await tx.pedido.create({
      data: {
        codigo: gerarCodigo('PED'),
        oferta_id: oferta.id,
        proposta_id: proposta.id,
        comprador_id: ator.id,
        preco_final: preco,
        quantidade_final: quantidade,
        endereco_entrega: dados.endereco_entrega,
        status: StatusPedido.NEGOCIANDO,
      },
    })
    return { proposta, pedido }
  })
}

/**
 * Expiração preguiçosa (24h): se a contraproposta venceu, persiste EXPIRADA e encerra a
 * negociação numa transação própria — para não ser desfeita pelo erro lançado em seguida.
 */
async function expirarSeVencida(contraPropostaId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.contraProposta.updateMany({
      where: { id: contraPropostaId, status: StatusContraProposta.PENDENTE, expira_em: { lte: new Date() } },
      data: { status: StatusContraProposta.EXPIRADA },
    })
    if (count === 0) return false

    const contra = await tx.contraProposta.findUniqueOrThrow({ where: { id: contraPropostaId } })
    await tx.proposta.updateMany({
      where: { id: contra.proposta_id, status: StatusProposta.CONTRAPROPOSTA },
      data: { status: StatusProposta.RECUSADA },
    })
    await arquivarPedidoNegociado(tx, contra.proposta_id)
    return true
  })
}

async function resolverContraProposta(
  ator: UsuarioAutenticado,
  contraPropostaId: string,
  decisao: typeof StatusContraProposta.ACEITA | typeof StatusContraProposta.RECUSADA,
): Promise<ContraProposta> {
  exigirPerfil(ator, PerfilUsuario.COMPRADOR)

  const contra = await prisma.contraProposta.findFirst({
    where: { id: contraPropostaId, excluido_em: null, proposta: { comprador_id: ator.id } },
  })
  if (!contra) throw new NotFoundError('Contraproposta não encontrada')
  if (await expirarSeVencida(contra.id)) throw new ConflictError('Contraproposta expirada')

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.contraProposta.updateMany({
      where: { id: contra.id, status: StatusContraProposta.PENDENTE, expira_em: { gt: new Date() } },
      data: { status: decisao },
    })
    if (count === 0) throw new ConflictError('Contraproposta não está mais pendente')

    const novoStatusProposta = decisao === StatusContraProposta.ACEITA ? StatusProposta.ACEITA : StatusProposta.RECUSADA
    const atualizada = await tx.proposta.updateMany({
      where: { id: contra.proposta_id, status: StatusProposta.CONTRAPROPOSTA },
      data: { status: novoStatusProposta },
    })
    if (atualizada.count === 0) throw new ConflictError('Proposta não está em contraproposta')

    if (decisao === StatusContraProposta.ACEITA) {
      const pedido = await pedidoDaProposta(tx, contra.proposta_id)
      await fecharPedidoComFrete(tx, pedido.id, StatusPedido.NEGOCIANDO, {
        preco_final: contra.preco_contraproposta,
        quantidade_final: contra.quantidade_contraproposta,
      })
    } else {
      await arquivarPedidoNegociado(tx, contra.proposta_id)
    }
    return tx.contraProposta.findUniqueOrThrow({ where: { id: contra.id } })
  })
}

export function aceitarContraProposta(ator: UsuarioAutenticado, contraPropostaId: string): Promise<ContraProposta> {
  return resolverContraProposta(ator, contraPropostaId, StatusContraProposta.ACEITA)
}

export function recusarContraProposta(ator: UsuarioAutenticado, contraPropostaId: string): Promise<ContraProposta> {
  return resolverContraProposta(ator, contraPropostaId, StatusContraProposta.RECUSADA)
}

// ------------------------------------------------------------------ Produtor

async function propostaDoProdutor(tx: Tx, ator: UsuarioAutenticado, propostaId: string) {
  exigirPerfil(ator, PerfilUsuario.PRODUTOR)
  const proposta = await tx.proposta.findFirst({
    where: { id: propostaId, excluido_em: null, oferta: { produtor_id: ator.id } },
    include: { oferta: true },
  })
  if (!proposta) throw new NotFoundError('Proposta não encontrada')
  return proposta
}

async function marcarProposta(tx: Tx, propostaId: string, para: StatusProposta): Promise<void> {
  const { count } = await tx.proposta.updateMany({
    where: { id: propostaId, status: StatusProposta.PENDENTE },
    data: { status: para },
  })
  if (count === 0) throw new ConflictError('Proposta não está pendente')
}

export async function aceitarProposta(
  ator: UsuarioAutenticado,
  propostaId: string,
): Promise<{ pedido: Pedido; frete: Frete }> {
  return prisma.$transaction(async (tx) => {
    const proposta = await propostaDoProdutor(tx, ator, propostaId)
    await marcarProposta(tx, proposta.id, StatusProposta.ACEITA)
    const pedido = await pedidoDaProposta(tx, proposta.id)
    return fecharPedidoComFrete(tx, pedido.id, StatusPedido.NEGOCIANDO)
  })
}

export async function recusarProposta(ator: UsuarioAutenticado, propostaId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const proposta = await propostaDoProdutor(tx, ator, propostaId)
    await marcarProposta(tx, proposta.id, StatusProposta.RECUSADA)
    await arquivarPedidoNegociado(tx, proposta.id)
  })
}

export type DadosContraProposta = {
  preco: ValorDecimal
  quantidade: ValorDecimal
  mensagem?: string | null
}

/** Valores ficam no histórico (ContraProposta); o Pedido só recebe os valores finais no aceite. */
export async function contrapropor(
  ator: UsuarioAutenticado,
  propostaId: string,
  dados: DadosContraProposta,
): Promise<ContraProposta> {
  const preco = exigirPositivo(dados.preco, 'preco')
  const quantidade = exigirPositivo(dados.quantidade, 'quantidade')

  return prisma.$transaction(async (tx) => {
    const proposta = await propostaDoProdutor(tx, ator, propostaId)
    if (quantidade.gt(proposta.oferta.quantidade)) {
      throw new AppError('Quantidade excede a quantidade ofertada', 422)
    }
    await marcarProposta(tx, proposta.id, StatusProposta.CONTRAPROPOSTA)
    return tx.contraProposta.create({
      data: {
        proposta_id: proposta.id,
        preco_contraproposta: preco,
        quantidade_contraproposta: quantidade,
        mensagem: dados.mensagem ?? null,
      },
    })
  })
}

export async function listarPropostas(ator: UsuarioAutenticado) {
  const filtroBase =
    ator.perfil === PerfilUsuario.COMPRADOR
      ? { comprador_id: ator.id, excluido_em: null }
      : ator.perfil === PerfilUsuario.PRODUTOR
        ? { oferta: { produtor_id: ator.id }, excluido_em: null }
        : { excluido_em: null }

  return prisma.proposta.findMany({
    where: filtroBase,
    include: {
      oferta: true,
      comprador: { select: { id: true, nome: true, whatsapp: true } },
      contrapropostas: { where: { excluido_em: null }, orderBy: { criado_em: 'desc' } },
      pedido: true,
    },
    orderBy: { criado_em: 'desc' },
  })
}

