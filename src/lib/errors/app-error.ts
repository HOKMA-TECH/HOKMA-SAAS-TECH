export type AppErrorCode = 'validation' | 'network' | 'unauthorized' | 'unknown'

export class AppError extends Error {
  readonly code: AppErrorCode

  constructor(message: string, code: AppErrorCode = 'unknown') {
    super(message)
    this.name = 'AppError'
    this.code = code
  }
}
