import { randomBytes } from 'node:crypto'
import { Prisma } from '../generated/prisma/client.js'
import type { PerfilUsuario } from '../generated/prisma/enums.js'
import type { UsuarioAutenticado } from '../middlewares/autenticar.js'
import { AppError, ForbiddenError } from '../errors.js'

export type ValorDecimal = string | number

/** RN12 — barra valores <= 0 (ou não numéricos) antes da persistência. */
export function exigirPositivo(valor: ValorDecimal | Prisma.Decimal, campo: string): Prisma.Decimal {
  let decimal: Prisma.Decimal
  try {
    decimal = new Prisma.Decimal(valor)
  } catch {
    throw new AppError(`${campo} inválido`, 400)
  }
  if (!decimal.isFinite() || decimal.lte(0)) throw new AppError(`${campo} deve ser maior que zero`, 400)
  return decimal
}

/** RN10 — defesa em profundidade: o serviço não confia apenas no middleware. */
export function exigirPerfil(ator: UsuarioAutenticado, ...perfis: PerfilUsuario[]): void {
  if (!perfis.includes(ator.perfil)) throw new ForbiddenError('Perfil sem permissão para esta ação')
}

export function gerarCodigo(prefixo: 'PED' | 'FRT'): string {
  return `${prefixo}-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`
}
