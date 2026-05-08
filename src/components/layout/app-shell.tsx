'use client'

import { MainLayout } from '@/components/layout/main-layout'

type AppShellProps = {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return <MainLayout>{children}</MainLayout>
}
