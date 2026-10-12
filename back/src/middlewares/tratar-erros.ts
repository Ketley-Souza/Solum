import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '../generated/prisma/client.js'
import { AppError } from '../errors.js'

export const tratarErros: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ erro: err.message })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: err.issues.map((issue) => ({ campo: issue.path.join('.'), mensagem: issue.message })),
    })
    return
  }

  // JSON malformado no corpo (express.json)
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ erro: 'JSON malformado' })
    return
  }

  // Violação de unicidade (ex.: email/documento já cadastrados)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    res.status(409).json({ erro: 'Registro já existente' })
    return
  }

  console.error(err)
  res.status(500).json({ erro: 'Erro interno do servidor' })
}
