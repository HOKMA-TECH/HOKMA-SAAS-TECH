import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type StatCardProps = {
  title: string
  value: string
  helper?: string
}

export function StatCard({ title, value, helper }: StatCardProps) {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
      </CardContent>
    </Card>
  )
}
