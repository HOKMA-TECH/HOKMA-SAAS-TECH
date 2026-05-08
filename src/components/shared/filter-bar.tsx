import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/shared/search-input'

export function FilterBar() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/60 p-3 md:flex-row md:items-center md:justify-between">
      <SearchInput placeholder="Buscar neste modulo..." />
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Filtro</Button>
        <Button variant="outline" size="sm">Ordenar</Button>
      </div>
    </div>
  )
}
