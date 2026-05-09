export function tenantQueryKey(tenantId: string | null, resource: string, ...parts: ReadonlyArray<string | number | boolean | null | undefined>) {
  return ['tenant', tenantId ?? 'none', resource, ...parts] as const
}
