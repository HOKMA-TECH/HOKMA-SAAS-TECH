import { AppError } from '@/lib/errors/app-error'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export async function httpClient<T>(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!base) {
    throw new AppError('API base URL não configurada.', 'validation')
  }

  const response = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new AppError('Falha ao processar a requisição.', 'network')
  }

  return (await response.json()) as T
}
