'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CrmHistoryEvent, CrmNote, CrmStage } from '@/features/crm/types'

export function CrmStageBadge({ stage }: { stage: CrmStage }) {
  return <Badge variant="outline">{stage}</Badge>
}

export function CrmSensitiveField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? 'nao informado'}</p>
    </div>
  )
}

export function CrmNotesPanel({ notes }: { notes: CrmNote[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Observacoes</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {notes.length === 0 ? <p className="text-xs text-muted-foreground">Sem observacoes.</p> : null}
        {notes.map((note) => (
          <div key={note.id} className="rounded border p-2 text-xs">
            <p>{note.note}</p>
            <p className="text-muted-foreground">{note.author_user_id.slice(0, 8)} • {new Date(note.created_at).toLocaleString('pt-BR')}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function CrmHistoryTimeline({ history }: { history: CrmHistoryEvent[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Historico</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {history.length === 0 ? <p className="text-xs text-muted-foreground">Sem historico.</p> : null}
        {history.map((event) => (
          <div key={event.id} className="rounded border p-2 text-xs">
            <p>{event.event_type}</p>
            <p className="text-muted-foreground">{event.from_stage ?? '-'} → {event.to_stage} • {new Date(event.created_at).toLocaleString('pt-BR')}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
