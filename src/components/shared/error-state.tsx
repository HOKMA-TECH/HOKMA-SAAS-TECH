import { AlertTriangle } from 'lucide-react'

export function ErrorState({ title = 'Erro ao carregar', description = 'Tente novamente em instantes.' }: { title?: string; description?: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <div className="mb-2 flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
