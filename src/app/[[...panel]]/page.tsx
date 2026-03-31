'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { NavRail } from '@/components/layout/nav-rail'
import { getPanel } from '@/lib/plugins'
import { Dashboard } from '@/components/dashboard/dashboard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Loader } from '@/components/ui/loader'

export default function UnifiedPage() {
  const pathname = usePathname()
  const tab = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean)
    return parts[0] || 'overview'
  }, [pathname])

  const PanelComponent = getPanel(tab)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <NavRail />
      <main className="flex-1 flex flex-col min-w-0 relative">
        <ErrorBoundary>
          {PanelComponent ? <PanelComponent /> : <Dashboard />}
        </ErrorBoundary>
      </main>
    </div>
  )
}
