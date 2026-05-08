'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LogoProps {
  collapsed?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ collapsed = false, className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-base', subtitle: 'text-[9px]' },
    md: { icon: 'w-10 h-10', text: 'text-lg', subtitle: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', text: 'text-xl', subtitle: 'text-xs' },
  }

  return (
    <motion.div 
      className={cn('flex items-center gap-3', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        'flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm',
        sizes[size].icon
      )}>
        <span className={cn(
          size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : 'text-xl'
        )}>H</span>
      </div>
      
      {!collapsed && (
        <motion.div 
          className="flex flex-col"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <span className={cn(
            'font-bold tracking-tight text-foreground leading-tight',
            sizes[size].text
          )}>
            HOKMA
          </span>
          <span className={cn(
            'font-medium text-muted-foreground tracking-wider uppercase leading-tight',
            sizes[size].subtitle
          )}>
            Gestão Imobiliária
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}
