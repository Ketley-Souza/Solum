import type { RequestHandler } from 'express'
import { StatusUsuario, type PerfilUsuario } from '../generated/prisma/enums.js'
import { prisma } from '../lib/prisma.js'
import { verificarToken, type PayloadToken } from '../lib/token.js'
import { ForbiddenError, UnauthorizedError } from '../errors.js'

export type UsuarioAutenticado = {
  id: string
  perfil: PerfilUsuario
  email: string
}

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioAutenticado
    }
  }
}

export const autenticar: RequestHandler = async (req, _res, next) => {
  const [esquema, token] = req.headers.authorization?.split(' ') ?? []
  if (esquema !== 'Bearer' || !token) throw new UnauthorizedError('Token ausente ou malformado')

  let payload: PayloadToken
  try {
    payload = verificarToken(token)
  } catch {
    throw new UnauthorizedError('Token inválido ou expirado')
  }

  // Consulta ao banco garante que suspensões (RN09) e soft-deletes valem imediatamente,
  // sem esperar a expiração do token.
  const usuario = await prisma.usuario.findFirst({
    where: { id: payload.id, excluido_em: null },
    select: { id: true, perfil: true, email: true, status: true },
  })
  if (!usuario) throw new UnauthorizedError('Usuário não encontrado')
  if (usuario.status === StatusUsuario.SUSPENSO) throw new ForbiddenError('Conta suspensa')

  req.usuario = { id: usuario.id, perfil: usuario.perfil, email: usuario.email }
  next()
}
