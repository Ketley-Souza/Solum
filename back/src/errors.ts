export class AppError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = new.target.name
    this.statusCode = statusCode
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Não autenticado') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflito com o estado atual do recurso') {
    super(message, 409)
  }
}
