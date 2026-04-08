'use client'

import { createElement, useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { NavRail } from '@/components/layout/nav-rail'
import { HeaderBar } from '@/components/layout/header-bar'
import { LiveFeed } from '@/components/layout/live-feed'
import { getPanel } from '@/lib/plugins'
import { useMissionControl } from '@/store'
import { useTranslations } from 'next-intl'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LocalModeBanner } from '@/components/layout/local-mode-banner'
import { UpdateBanner } from '@/components/layout/update-banner'
import { OpenClawUpdateBanner } from '@/components/layout/openclaw-update-banner'
import { OpenClawDoctorBanner } from '@/components/layout/openclaw-doctor-banner'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { Loader } from '@/components/ui/loader'

export default function UnifiedPage() {
  const pathname = usePathname()
  const {
    dashboardMode,
    bootComplete,
    setBootComplete,
    liveFeedOpen,
    showOnboarding,
    updateAvailable,
    openclawUpdate,
    doctorDismissedAt
  } = useMissionControl()
  const tp = useTranslations('page')

  const tab = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean)
    return parts[0] || 'overview'
  }, [pathname])

  useEffect(() => {
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
        <HeaderBar />

        <div className="flex-1 overflow-hidden flex flex-col relative">
          <LocalModeBanner />
          <UpdateBanner />
          <OpenClawUpdateBanner />
          <OpenClawDoctorBanner />

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <ErrorBoundary>
              {isRestricted ? (
                <LocalModeUnavailable panel={tab} />
              ) : PanelComponent ? (
                createElement(PanelComponent)
              ) : (
                <div className="p-8">
                  <h1 className="text-xl font-bold">Panel Not Registered: {tab}</h1>
                  <p className="text-muted-foreground">Please ensure the plugin for "{tab}" is properly initialized.</p>
                </div>
              )}
            </ErrorBoundary>
          </div>
        </div>

        {showOnboarding && <OnboardingWizard />}
      </main>

      {liveFeedOpen && <LiveFeed />}
    </div>
  )
}

function LocalModeUnavailable({ panel }: { panel: string }) {
  const tp = useTranslations('page')
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-sm text-muted-foreground">
        {tp('requiresGateway', { panel })}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {tp('configureGateway')}
      </p>
    </div>
  )
}
