export const PASSWORD_POLICY = {
  minLength: 12,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /\d/,
  symbol: /[^A-Za-z0-9]/,
}

export function validateStrongPassword(password: string): string[] {
  const errors: string[] = []
  if (password.length < PASSWORD_POLICY.minLength) errors.push(`Use pelo menos ${PASSWORD_POLICY.minLength} caracteres.`)
  if (!PASSWORD_POLICY.upper.test(password)) errors.push('Inclua pelo menos uma letra maiuscula.')
  if (!PASSWORD_POLICY.lower.test(password)) errors.push('Inclua pelo menos uma letra minuscula.')
  if (!PASSWORD_POLICY.number.test(password)) errors.push('Inclua pelo menos um numero.')
  if (!PASSWORD_POLICY.symbol.test(password)) errors.push('Inclua pelo menos um simbolo.')
  return errors
}
