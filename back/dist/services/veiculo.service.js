import { PerfilUsuario, StatusFrete } from '../generated/prisma/enums.js';
import { prisma } from '../lib/prisma.js';
import { ConflictError, NotFoundError } from '../errors.js';
import { exigirPerfil, exigirPositivo } from './comum.js';
export async function cadastrarVeiculo(ator, dados) {
    exigirPerfil(ator, PerfilUsuario.TRANSPORTADOR);
    return prisma.veiculo.create({
        data: {
            transportador_id: ator.id,
            tipo_veiculo: dados.tipo_veiculo,
            capacidade_toneladas: exigirPositivo(dados.capacidade_toneladas, 'capacidade_toneladas'),
        },
    });
}
export async function listarVeiculos(ator) {
    exigirPerfil(ator, PerfilUsuario.TRANSPORTADOR);
    return prisma.veiculo.findMany({
        where: { transportador_id: ator.id, excluido_em: null },
        orderBy: { criado_em: 'desc' },
    });
}
/** RN11 — soft-delete; bloqueado se o veículo estiver em frete ativo. */
export async function desativarVeiculo(ator, veiculoId) {
    exigirPerfil(ator, PerfilUsuario.TRANSPORTADOR);
    await prisma.$transaction(async (tx) => {
        const emUso = await tx.frete.count({
            where: { veiculo_id: veiculoId, status: { in: [StatusFrete.ACEITO, StatusFrete.EM_ROTA] } },
        });
        if (emUso > 0)
            throw new ConflictError('Veículo vinculado a frete em andamento');
        const { count } = await tx.veiculo.updateMany({
            where: { id: veiculoId, transportador_id: ator.id, excluido_em: null },
            data: { excluido_em: new Date() },
        });
        if (count === 0)
            throw new NotFoundError('Veículo não encontrado');
    });
}
