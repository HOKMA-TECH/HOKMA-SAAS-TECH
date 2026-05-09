export default function PendingApprovalPage() {
  return (
    <main className="mx-auto max-w-xl space-y-3 p-8">
      <h1 className="text-2xl font-semibold">Aguardando aprovacao</h1>
      <p className="text-sm text-muted-foreground">
        Sua solicitacao de acesso foi enviada. Por seguranca, esta conta permanece bloqueada ate aprovacao de administrador.
      </p>
    </main>
  )
}
