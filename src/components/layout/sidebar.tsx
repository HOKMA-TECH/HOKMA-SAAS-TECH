'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/store'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Building2,
  CheckSquare,
  Globe,
  FileText,
  BarChart3,
  Calculator,
  PiggyBank,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useCan } from '@/features/auth/authorization'
import type { Capability } from '@/features/auth/capabilities'
import type { AccessContext } from '@/features/auth/route-capabilities'

const navigation: Array<{ name: string; href: string; icon: any; capability?: Capability; context?: AccessContext }> = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clientes', icon: Users, capability: 'clientes.read', context: 'tenant' },
  { name: 'Agenda', href: '/agenda', icon: Calendar, capability: 'agenda.read', context: 'tenant' },
  { name: 'Chat', href: '/chat', icon: MessageSquare, capability: 'documentos.read', context: 'tenant' },
  { name: 'Empreendimentos', href: '/empreendimentos', icon: Building2, capability: 'clientes.read', context: 'tenant' },
  { name: 'Tarefas', href: '/tarefas', icon: CheckSquare, capability: 'tarefas.read' },
  { name: 'Portais', href: '/portais', icon: Globe, capability: 'clientes.read', context: 'tenant' },
  { name: 'Conversor PDF', href: '/conversor-pdf', icon: FileText },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3, capability: 'relatorios.read', context: 'tenant' },
  { name: 'Apuração de Renda', href: '/apuracao-renda', icon: PiggyBank },
  { name: 'Calculadora', href: '/calculadora', icon: Calculator },
  { name: 'Painel Admin', href: '/admin', icon: Shield, capability: 'tenant.audit.read', context: 'tenant' },
  { name: 'Configurações', href: '/configuracoes', icon: Settings, capability: 'tenant.settings.manage', context: 'tenant' },
  { name: 'Platform', href: '/platform', icon: Shield, capability: 'platform.tenants.manage', context: 'platform' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const canReadClients = useCan('clientes.read')
  const canReadAgenda = useCan('agenda.read')
  const canReadTasks = useCan('tarefas.read')
  const canReadReports = useCan('relatorios.read')
  const canReadTenantAudit = useCan('tenant.audit.read')
  const canManageSettings = useCan('tenant.settings.manage')
  const canReadDocs = useCan('documentos.read')
  const canPlatformManage = useCan('platform.tenants.manage', { context: 'platform' })

  const capabilityMap: Partial<Record<Capability, boolean>> = {
    'clientes.read': canReadClients,
    'agenda.read': canReadAgenda,
    'tarefas.read': canReadTasks,
    'relatorios.read': canReadReports,
    'tenant.audit.read': canReadTenantAudit,
    'tenant.settings.manage': canManageSettings,
    'documentos.read': canReadDocs,
    'platform.tenants.manage': canPlatformManage,
  }

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar flex flex-col"
      >
        {/* Header */}
        <div className={cn(
          'flex h-16 items-center border-b border-sidebar-border px-4',
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        )}>
          <Logo collapsed={sidebarCollapsed} />
          
          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={toggleSidebar}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="flex flex-col gap-1 px-3">
            {navigation.filter((item) => {
              if (!item.capability) return true
              return capabilityMap[item.capability] ?? false
            }).map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
              const Icon = item.icon

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground/70',
                    sidebarCollapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5 shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  
                  <AnimatePresence mode="wait">
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="truncate"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}>
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return <div key={item.href}>{linkContent}</div>
            })}
          </nav>
        </ScrollArea>

        {/* Toggle Button (collapsed state) */}
        {sidebarCollapsed && (
          <div className="border-t border-sidebar-border p-3">
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-10 text-muted-foreground hover:text-foreground"
              onClick={toggleSidebar}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </motion.aside>
    </TooltipProvider>
  )
}
