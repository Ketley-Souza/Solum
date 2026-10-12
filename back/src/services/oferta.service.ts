import type { Oferta } from '../generated/prisma/client.js'
import { PerfilUsuario, StatusOferta } from '../generated/prisma/enums.js'
import type { UsuarioAutenticado } from '../middlewares/autenticar.js'
import { prisma } from '../lib/prisma.js'
import { ConflictError, NotFoundError } from '../errors.js'
import { exigirPerfil, exigirPositivo, type ValorDecimal } from './comum.js'
import { converterParaToneladas } from './pedido.service.js'

export type DadosOferta = {
  produto: string
  categoria: string
  qualidade: string
  safra: string
  quantidade: ValorDecimal
  unidade: string
  preco: ValorDecimal
  localizacao: string
  periodo: string
  descricao?: string | null
  imagem_url?: string | null
}

export async function criarOferta(ator: UsuarioAutenticado, dados: DadosOferta): Promise<Oferta> {
  exigirPerfil(ator, PerfilUsuario.PRODUTOR)
  const quantidade = exigirPositivo(dados.quantidade, 'quantidade')
  // Falha cedo: sem conversão para toneladas o frete (RN06) não poderia ser emitido no fechamento.
  converterParaToneladas(quantidade, dados.unidade)

  return prisma.oferta.create({
    data: {
      produtor_id: ator.id,
      produto: dados.produto,
      categoria: dados.categoria,
      qualidade: dados.qualidade,
      safra: dados.safra,
      quantidade,
      unidade: dados.unidade,
      preco: exigirPositivo(dados.preco, 'preco'),
      localizacao: dados.localizacao,
      periodo: dados.periodo,
      descricao: dados.descricao ?? null,
      imagem_url: dados.imagem_url ?? null,
    },
  })
}

/** ATIVA <-> PAUSADA; ATIVA/PAUSADA -> ENCERRADA (terminal). */
const ORIGENS_PERMITIDAS: Record<StatusOferta, readonly StatusOferta[]> = {
  [StatusOferta.ATIVA]: [StatusOferta.PAUSADA],
  [StatusOferta.PAUSADA]: [StatusOferta.ATIVA],
  [StatusOferta.ENCERRADA]: [StatusOferta.ATIVA, StatusOferta.PAUSADA],
}

export async function alterarStatusOferta(
  ator: UsuarioAutenticado,
  ofertaId: string,
  novoStatus: StatusOferta,
): Promise<void> {
  exigirPerfil(ator, PerfilUsuario.PRODUTOR)
  const { count } = await prisma.oferta.updateMany({
    where: {
      id: ofertaId,
      produtor_id: ator.id,
      excluido_em: null,
      status: { in: [...ORIGENS_PERMITIDAS[novoStatus]] },
    },
    data: { status: novoStatus },
  })
  if (count === 0) throw new ConflictError(`Oferta inexistente ou transição para ${novoStatus} não permitida`)
}

/** RN09 + RN11 — remoção administrativa por soft-delete. */
export async function removerOfertaPorAdmin(ator: UsuarioAutenticado, ofertaId: string): Promise<void> {
  exigirPerfil(ator, PerfilUsuario.ADMINISTRADOR)
  const { count } = await prisma.oferta.updateMany({
    where: { id: ofertaId, excluido_em: null },
    data: { status: StatusOferta.ENCERRADA, excluido_em: new Date() },
  })
  if (count === 0) throw new NotFoundError('Oferta não encontrada')
}

export async function listarOfertas(statusFiltro?: StatusOferta) {
  return prisma.oferta.findMany({
    where: {
      excluido_em: null,
      status: statusFiltro ?? StatusOferta.ATIVA,
    },
    include: {
      produtor: {
        select: { id: true, nome: true, whatsapp: true, perfil: true },
      },
    },
    orderBy: { criado_em: 'desc' },
  })
}

