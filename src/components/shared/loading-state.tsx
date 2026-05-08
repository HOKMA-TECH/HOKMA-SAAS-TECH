import { Loader2 } from 'lucide-react'

export function LoadingState({ label = 'Carregando dados...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border bg-card/70 p-8">
      <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
