import { ERROR_CODES, ErrorCode } from '@waggora/shared'

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(code: ErrorCode, message: string) {
    super(code, message, 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(ERROR_CODES.UNAUTHORIZED, message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(ERROR_CODES.FORBIDDEN, message, 403)
  }
}

export class InsufficientBalanceError extends AppError {
  constructor(balance: number, required: number) {
    super(
      ERROR_CODES.INSUFFICIENT_BALANCE,
      `Player balance (${balance}) is less than required (${required})`,
      402,
      { balance, required },
    )
  }
}

export class ConflictError extends AppError {
  constructor(code: ErrorCode, message: string) {
    super(code, message, 409)
  }
}
