import { Prisma, type Frete } from '../generated/prisma/client.js'
import { PerfilUsuario, StatusFrete, StatusPedido, TipoReferencia } from '../generated/prisma/enums.js'
import type { UsuarioAutenticado } from '../middlewares/autenticar.js'
import { prisma } from '../lib/prisma.js'
import { AppError, ConflictError, ForbiddenError, NotFoundError } from '../errors.js'
import { exigirPerfil } from './comum.js'
import { transicionarPedido } from './pedido.service.js'
import { notificarUsuarios } from './notificacao.service.js'

type Tx = Prisma.TransactionClient

/** RECUSADO não possui transição de entrada definida (semântica pendente de especificação). */
const TRANSICOES_FRETE: Record<StatusFrete, readonly StatusFrete[]> = {
  [StatusFrete.DISPONIVEL]: [StatusFrete.ACEITO],
  [StatusFrete.ACEITO]: [StatusFrete.EM_ROTA],
  [StatusFrete.EM_ROTA]: [StatusFrete.ENTREGUE],
  [StatusFrete.RECUSADO]: [],
  [StatusFrete.ENTREGUE]: [],
}

function exigirTransicaoFrete(de: StatusFrete, para: StatusFrete): void {
  if (!TRANSICOES_FRETE[de].includes(para)) {
    throw new ConflictError(`Transição de frete inválida: ${de} -> ${para}`)
  }
}

/**
 * RN07 — aceite imune a race condition. O UPDATE condicional (status = DISPONIVEL AND
 * transportador_id IS NULL) faz o PostgreSQL serializar escritores concorrentes na mesma linha:
 * o segundo reavalia o WHERE após o commit do primeiro e afeta 0 linhas.
 * A FK composta (veiculo_id, transportador_id) garante a posse do veículo também no banco.
 */
export async function aceitarFrete(ator: UsuarioAutenticado, freteId: string, veiculoId: string): Promise<Frete> {
  exigirPerfil(ator, PerfilUsuario.TRANSPORTADOR)
  exigirTransicaoFrete(StatusFrete.DISPONIVEL, StatusFrete.ACEITO)

  return prisma.$transaction(async (tx) => {
    const veiculo = await tx.veiculo.findFirst({
      where: { id: veiculoId, transportador_id: ator.id, excluido_em: null },
    })
    if (!veiculo) throw new ForbiddenError('Veículo não pertence ao transportador')

    const frete = await tx.frete.findFirst({ where: { id: freteId, excluido_em: null } })
    if (!frete) throw new NotFoundError('Frete não encontrado')
    if (veiculo.capacidade_toneladas.lt(frete.peso_toneladas)) {
      throw new AppError('Capacidade do veículo inferior ao peso do frete', 422)
    }

    const { count } = await tx.frete.updateMany({
      where: { id: freteId, status: StatusFrete.DISPONIVEL, transportador_id: null, excluido_em: null },
      data: { status: StatusFrete.ACEITO, transportador_id: ator.id, veiculo_id: veiculo.id },
    })
    if (count === 0) throw new ConflictError('Frete indisponível: já aceito por outro transportador')

    const aceito = await tx.frete.findUniqueOrThrow({ where: { id: freteId } })
    const transportador = await tx.usuario.findUniqueOrThrow({
      where: { id: ator.id },
      select: { nome: true, whatsapp: true },
    })
    await notificarAndamentoFrete(
      tx,
      aceito,
      'Frete aceito por transportador',
      `Transportador: ${transportador.nome} · telefone ${transportador.whatsapp}.`,
    )
    return aceito
  })
}

/**
 * Avisa comprador e produtor do pedido sobre o andamento do frete.
 * `complementoComprador` é anexado somente à mensagem do comprador.
 */
async function notificarAndamentoFrete(
  tx: Tx,
  frete: Frete,
  titulo: string,
  complementoComprador?: string,
): Promise<void> {
  const pedido = await tx.pedido.findUniqueOrThrow({
    where: { id: frete.pedido_id },
    include: { oferta: { select: { produtor_id: true } } },
  })
  const mensagem = `Pedido ${pedido.codigo} · frete ${frete.codigo}.`
  const referencia = { tipo_referencia: TipoReferencia.PEDIDO, referencia_id: pedido.id }

  if (!complementoComprador) {
    await notificarUsuarios(tx, [pedido.comprador_id, pedido.oferta.produtor_id], { titulo, mensagem, ...referencia })
    return
  }
  await notificarUsuarios(tx, [pedido.comprador_id], { titulo, mensagem: `${mensagem} ${complementoComprador}`, ...referencia })
  await notificarUsuarios(tx, [pedido.oferta.produtor_id], { titulo, mensagem, ...referencia })
}

async function avancarFrete(
  ator: UsuarioAutenticado,
  freteId: string,
  de: StatusFrete,
  para: StatusFrete,
  pedidoDe: StatusPedido,
  pedidoPara: StatusPedido,
  titulo: string,
): Promise<Frete> {
  exigirPerfil(ator, PerfilUsuario.TRANSPORTADOR)
  exigirTransicaoFrete(de, para)

  return prisma.$transaction(async (tx: Tx) => {
    const { count } = await tx.frete.updateMany({
      where: { id: freteId, transportador_id: ator.id, status: de, excluido_em: null },
      data: { status: para },
    })
    if (count === 0) throw new ConflictError(`Frete inexistente, de outro transportador ou fora de ${de}`)

    const frete = await tx.frete.findUniqueOrThrow({ where: { id: freteId } })
    await transicionarPedido(tx, frete.pedido_id, pedidoDe, pedidoPara)
    await notificarAndamentoFrete(tx, frete, titulo)
    return frete
  })
}

export function iniciarTransporte(ator: UsuarioAutenticado, freteId: string): Promise<Frete> {
  return avancarFrete(ator, freteId, StatusFrete.ACEITO, StatusFrete.EM_ROTA, StatusPedido.FECHADO, StatusPedido.EM_TRANSPORTE, 'Pedido em transporte')
}

export function confirmarEntrega(ator: UsuarioAutenticado, freteId: string): Promise<Frete> {
  return avancarFrete(ator, freteId, StatusFrete.EM_ROTA, StatusFrete.ENTREGUE, StatusPedido.EM_TRANSPORTE, StatusPedido.ENTREGUE, 'Pedido entregue')
}

export async function listarFretes(
  ator: UsuarioAutenticado,
  statusFiltro?: StatusFrete,
): Promise<Frete[]> {
  exigirPerfil(
    ator,
    PerfilUsuario.TRANSPORTADOR,
    PerfilUsuario.ADMINISTRADOR,
    PerfilUsuario.PRODUTOR,
    PerfilUsuario.COMPRADOR,
  );

  const escopoTransportador =
    ator.perfil === PerfilUsuario.TRANSPORTADOR
      ? {
          OR: [
            {
              status: StatusFrete.DISPONIVEL,
              transportador_id: null,
            },
            {
              transportador_id: ator.id,
            },
          ],
        }
      : {};

  return prisma.frete.findMany({
    where: {
      excluido_em: null,

      ...(statusFiltro
        ? { status: statusFiltro }
        : {}),

      ...escopoTransportador,
    },

    include: {
      pedido: {
        include: {
          oferta: {
            select: {
              produto: true,
              categoria: true,
            },
          },
        },
      },
    },

    orderBy: {
      criado_em: "desc",
    },
  });
}