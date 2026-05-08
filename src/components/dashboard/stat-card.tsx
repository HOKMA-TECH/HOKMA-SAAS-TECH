'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  iconColor?: 'blue' | 'orange' | 'green' | 'indigo'
  index?: number
}

export function StatCard({ 
  title, 
  value, 
  description,
  icon: Icon, 
  iconColor = 'blue',
  index = 0 
}: StatCardProps) {
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString('pt-BR')
    : value

  const iconColorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="hover:shadow-sm transition-shadow duration-200 border border-border/50 h-full">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className={cn(
              'p-2 rounded-lg border',
              iconColorClasses[iconColor]
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <button className="p-1 rounded-lg hover:bg-muted transition-colors">
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
          
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {title}
          </p>
          
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {formattedValue}
          </p>
          
          <p className="text-xs text-muted-foreground mt-auto pt-2 line-clamp-2 min-h-[32px]">
            {description || '\u00A0'}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
