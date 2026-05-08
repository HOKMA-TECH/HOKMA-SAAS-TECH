import { create } from 'zustand'

type UIStore = {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useUIStoreV2 = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
