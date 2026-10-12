import type { RequestHandler } from 'express'
import type { PerfilUsuario } from '../generated/prisma/enums.js'
import { ForbiddenError, UnauthorizedError } from '../errors.js'

/** RN10 — usar sempre depois de `autenticar`. */
export function autorizar(...perfis: PerfilUsuario[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.usuario) throw new UnauthorizedError()
    if (!perfis.includes(req.usuario.perfil)) throw new ForbiddenError()
    next()
  }
}
