import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: string
  description: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-6 flex flex-col gap-4 border-b border-border/60 pb-4 md:flex-row md:items-start md:justify-between', className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  )
}
