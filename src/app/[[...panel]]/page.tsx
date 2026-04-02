'use client'

import { useMemo, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { NavRail } from '@/components/layout/nav-rail'
import { getPanel } from '@/lib/plugins'
import { Dashboard } from '@/components/dashboard/dashboard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Loader } from '@/components/ui/loader'
import { useMissionControl } from '@/store'
import { useTranslations } from 'next-intl'

export default function UnifiedPage() {
  const pathname = usePathname()
  const { dashboardMode, bootComplete, setBootComplete } = useMissionControl()
  const tp = useTranslations('page')

  const tab = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean)
    return parts[0] || 'overview'
  }, [pathname])

  useEffect(() => {
    // Simulate boot completion logic if not already set
    if (!bootComplete) {
      const timer = setTimeout(() => setBootComplete(), 500)
      return () => clearTimeout(timer)
    }
  }, [bootComplete, setBootComplete])

  const PanelComponent = getPanel(tab)
  const isLocal = dashboardMode === 'local'

  // Panels that REQUIRE gateway mode
  const gatewayOnly = ['gateways', 'gateway-config', 'channels', 'nodes', 'exec-approvals']
  const isRestricted = isLocal && gatewayOnly.includes(tab)

  if (!bootComplete) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <NavRail />
      <main className="flex-1 flex flex-col min-w-0 relative">
        <ErrorBoundary>
          {isRestricted ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-sm text-muted-foreground">
                {tp('requiresGateway', { panel: tab })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {tp('configureGateway')}
              </p>
            </div>
          ) : PanelComponent ? (
            <PanelComponent />
          ) : tab === 'overview' ? (
            <Dashboard />
          ) : (
            <div className="p-8">
              <h1 className="text-xl font-bold">Panel Not Registered: {tab}</h1>
              <p className="text-muted-foreground">Please ensure the plugin for "{tab}" is properly initialized.</p>
            </div>
          )}
        </ErrorBoundary>
      </main>
    </div>
  )
}
