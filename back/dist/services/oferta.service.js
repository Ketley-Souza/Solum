import { PerfilUsuario, StatusOferta } from '../generated/prisma/enums.js';
import { prisma } from '../lib/prisma.js';
import { ConflictError, NotFoundError } from '../errors.js';
import { exigirPerfil, exigirPositivo } from './comum.js';
import { converterParaToneladas } from './pedido.service.js';
import { notificarNovaOferta } from './notificacao.service.js';
export async function criarOferta(ator, dados) {
    exigirPerfil(ator, PerfilUsuario.PRODUTOR);
    const quantidade = exigirPositivo(dados.quantidade, 'quantidade');
    // Falha cedo: sem conversão para toneladas o frete (RN06) não poderia ser emitido no fechamento.
    converterParaToneladas(quantidade, dados.unidade);
    const oferta = await prisma.oferta.create({
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
    });
    await notificarNovaOferta(oferta);
    return oferta;
}
/** ATIVA <-> PAUSADA; ATIVA/PAUSADA -> ENCERRADA (terminal). */
const ORIGENS_PERMITIDAS = {
    [StatusOferta.ATIVA]: [StatusOferta.PAUSADA],
    [StatusOferta.PAUSADA]: [StatusOferta.ATIVA],
    [StatusOferta.ENCERRADA]: [StatusOferta.ATIVA, StatusOferta.PAUSADA],
};
export async function alterarStatusOferta(ator, ofertaId, novoStatus) {
    exigirPerfil(ator, PerfilUsuario.PRODUTOR);
    const { count } = await prisma.oferta.updateMany({
        where: {
            id: ofertaId,
            produtor_id: ator.id,
            excluido_em: null,
            status: { in: [...ORIGENS_PERMITIDAS[novoStatus]] },
        },
        data: { status: novoStatus },
    });
    if (count === 0)
        throw new ConflictError(`Oferta inexistente ou transição para ${novoStatus} não permitida`);
}
export async function atualizarOferta(ator, ofertaId, dados) {
    exigirPerfil(ator, PerfilUsuario.PRODUTOR);
    const quantidade = exigirPositivo(dados.quantidade, 'quantidade');
    converterParaToneladas(quantidade, dados.unidade);
    const oferta = await prisma.oferta.updateMany({
        where: { id: ofertaId, produtor_id: ator.id, excluido_em: null, status: { not: StatusOferta.ENCERRADA } },
        data: {
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
    });
    if (oferta.count === 0)
        throw new NotFoundError('Oferta não encontrada ou encerrada');
    return prisma.oferta.findUniqueOrThrow({ where: { id: ofertaId } });
}
/** RN09 + RN11 — remoção administrativa por soft-delete. */
export async function removerOfertaPorAdmin(ator, ofertaId) {
    exigirPerfil(ator, PerfilUsuario.ADMINISTRADOR);
    const { count } = await prisma.oferta.updateMany({
        where: { id: ofertaId, excluido_em: null },
        data: { status: StatusOferta.ENCERRADA, excluido_em: new Date() },
    });
    if (count === 0)
        throw new NotFoundError('Oferta não encontrada');
}
export async function listarOfertas(statusFiltro) {
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
    });
}
