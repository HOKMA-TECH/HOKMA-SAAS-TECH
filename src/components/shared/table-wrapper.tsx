import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TableWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
