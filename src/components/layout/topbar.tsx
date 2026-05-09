'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUIStore, useTenantStore } from '@/lib/store'
import { mockTenants, mockNotifications } from '@/lib/mock-data'
import { useAuth } from '@/features/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Bell,
  Building2,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Check,
  Info,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

export function Topbar() {
  const { sidebarCollapsed } = useUIStore()
  const { user, profile, activeMembership, signOut } = useAuth()
  const { currentTenant, setCurrentTenant } = useTenantStore()
  const [searchFocused, setSearchFocused] = useState(false)

  // Initialize with mock data if not set
  const tenant = currentTenant || mockTenants[0]
  const notifications = mockNotifications

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      default:
        return <Info className="h-4 w-4 text-primary" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'transition-all duration-200',
        sidebarCollapsed ? 'left-[72px]' : 'left-64'
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors',
              searchFocused ? 'text-primary' : 'text-muted-foreground'
            )} />
            <Input
              placeholder="Buscar clientes, empreendimentos..."
              className={cn(
                'pl-10 h-10 bg-secondary/50 border-transparent',
                'focus:bg-background focus:border-input',
                'transition-all duration-200'
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Tenant Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-10 px-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-[150px] truncate text-sm font-medium">
                  {tenant.name}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Selecionar Imobiliária</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {mockTenants.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => setCurrentTenant(t)}
                  className="gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  <span className="flex-1 truncate">{t.name}</span>
                  {tenant.id === t.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h4 className="font-semibold">Notificações</h4>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                  Marcar todas como lidas
                </Button>
              </div>
              <ScrollArea className="h-[300px]">
                <AnimatePresence>
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'flex gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors',
                        !notification.read && 'bg-primary/5'
                      )}
                    >
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-10 pl-2 pr-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_path ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {(profile?.display_name ?? user?.email ?? 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-tight">
                    {profile?.display_name || user?.email || 'Usuario'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeMembership?.role || 'Sem role'}
                  </p>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <User className="h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="gap-2 text-destructive focus:text-destructive"
                onClick={() => {
                  void signOut().finally(() => {
                  window.location.href = '/login'
                  })
                }}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
