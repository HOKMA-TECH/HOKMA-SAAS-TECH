import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tipos
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'manager' | 'agent' | 'viewer'
}

export interface Tenant {
  id: string
  name: string
  logo?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
}

// Store de UI
interface UIState {
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarMobileOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
    }),
    {
      name: 'hokma-ui-storage',
    }
  )
)

// Store de Autenticação
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'hokma-auth-storage',
    }
  )
)

// Store de Tenant
interface TenantState {
  currentTenant: Tenant | null
  tenants: Tenant[]
  setCurrentTenant: (tenant: Tenant | null) => void
  setTenants: (tenants: Tenant[]) => void
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      currentTenant: null,
      tenants: [],
      setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
      setTenants: (tenants) => set({ tenants }),
    }),
    {
      name: 'hokma-tenant-storage',
    }
  )
)

// Store de Notificações
interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
        },
        ...state.notifications,
      ],
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearAll: () => set({ notifications: [] }),
}))

// Store de Filtros Globais
interface FilterState {
  globalSearch: string
  dateRange: { from: Date | null; to: Date | null }
  setGlobalSearch: (search: string) => void
  setDateRange: (range: { from: Date | null; to: Date | null }) => void
  clearFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  globalSearch: '',
  dateRange: { from: null, to: null },
  setGlobalSearch: (search) => set({ globalSearch: search }),
  setDateRange: (range) => set({ dateRange: range }),
  clearFilters: () => set({ globalSearch: '', dateRange: { from: null, to: null } }),
}))
