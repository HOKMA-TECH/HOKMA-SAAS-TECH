'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/store'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      
      <motion.main
        initial={false}
        animate={{ 
          marginLeft: sidebarCollapsed ? 72 : 256,
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="pt-16 min-h-screen"
      >
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  )
}
