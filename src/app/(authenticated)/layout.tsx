import { AppShell } from '@/components/layout/app-shell'
import { AuthenticatedGuard } from '@/features/auth/auth-guards'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedGuard>
      <AppShell>{children}</AppShell>
    </AuthenticatedGuard>
  )
}
