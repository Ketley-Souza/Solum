import { randomBytes } from 'node:crypto';
import { Prisma } from '../generated/prisma/client.js';
import { AppError, ForbiddenError } from '../errors.js';
/** RN12 — barra valores <= 0 (ou não numéricos) antes da persistência. */
export function exigirPositivo(valor, campo) {
    let decimal;
    try {
        decimal = new Prisma.Decimal(valor);
    }
    catch {
        throw new AppError(`${campo} inválido`, 400);
    }
    if (!decimal.isFinite() || decimal.lte(0))
        throw new AppError(`${campo} deve ser maior que zero`, 400);
    return decimal;
}
/** RN10 — defesa em profundidade: o serviço não confia apenas no middleware. */
export function exigirPerfil(ator, ...perfis) {
    if (!perfis.includes(ator.perfil))
        throw new ForbiddenError('Perfil sem permissão para esta ação');
}
export function gerarCodigo(prefixo) {
    return `${prefixo}-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;
}
