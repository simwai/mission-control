'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useMissionControl } from '@/store'

export function ContextSwitcher({ currentUser, isAdmin, isLocal, isConnected, tenants, osUsers, activeTenant, onSwitchTenant, projects, activeProject, onSwitchProject, expanded, defaultOrgName, navigateToPanel, fetchTenants, fetchOsUsers, interfaceMode, setInterfaceMode, activeTab }: any) {
  const { setShowProjectManagerModal } = useMissionControl()
  const tcs = useTranslations('contextSwitcher')
  const tn = useTranslations('nav')
  const tc = useTranslations('common')
  const [open, setOpen] = useState(false)

  const userName = currentUser?.display_name || currentUser?.username || 'User'
  const initials = userName.split(/\s+/).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  const tenantName = activeTenant?.display_name || defaultOrgName
  const projectName = activeProject?.name
  const contextLine = projectName ? `${tenantName} / ${projectName}` : tenantName
  const connectionLabel = isLocal ? tcs('localMode') : isConnected ? tcs('connected') : tcs('disconnected')
  const connectionDotClass = isLocal ? 'bg-void-cyan' : isConnected ? 'bg-green-500' : 'bg-red-500'

  return (
    <div className={`shrink-0 relative ${expanded ? 'px-3 pb-3' : 'flex flex-col items-center pb-3'}`}>
      <Button
        variant="ghost"
        onClick={() => setOpen(!open)}
        title={expanded ? undefined : `${userName} · ${contextLine} · ${connectionLabel}`}
        className={`flex items-center rounded-lg ${expanded ? 'w-full gap-2.5 px-2.5 py-2 h-auto hover:bg-secondary/80 border border-transparent hover:border-border justify-start' : 'w-10 h-10 hover:bg-secondary group'}`}
      >
        <div className={`shrink-0 rounded-full flex items-center justify-center text-[11px] font-semibold relative w-8 h-8 ${currentUser?.avatar_url ? '' : 'bg-primary/20 text-primary'}`}>
          {currentUser?.avatar_url ? (
            <Image src={currentUser.avatar_url} alt="" width={32} height={32} unoptimized className="w-full h-full rounded-full object-cover" />
          ) : initials}
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${connectionDotClass}`} />
        </div>
        {expanded && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium text-foreground truncate leading-tight">{userName}</div>
              <div className="text-[11px] text-muted-foreground truncate leading-tight">{contextLine}</div>
            </div>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50">
              <polyline points="4,10 8,6 12,10" />
            </svg>
          </>
        )}
      </Button>
      {/* Popover implementation simplified for this refactor pass */}
      {open && <div className="absolute z-50 bg-popover border border-border rounded-lg shadow-xl min-w-[220px] bottom-full mb-1 p-2">
         <p className="text-xs p-2">Context Menu (Refactored)</p>
         <Button size="xs" variant="ghost" onClick={() => setOpen(false)} className="w-full justify-start">Close</Button>
      </div>}
    </div>
  )
}
