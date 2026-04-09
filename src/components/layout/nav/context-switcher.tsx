'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useMissionControl } from '@/store'
import { cn } from '@/lib/utils'

export function ContextSwitcher({ currentUser, isAdmin, isLocal, isConnected, tenants, osUsers, activeTenant, onSwitchTenant, projects, activeProject, onSwitchProject, expanded, defaultOrgName, navigateToPanel, fetchTenants, fetchOsUsers, interfaceMode, setInterfaceMode, activeTab }: any) {
  const { setShowProjectManagerModal } = useMissionControl()
  const tcs = useTranslations('contextSwitcher')
  const [open, setOpen] = useState(false)

  const userName = currentUser?.display_name || currentUser?.username || 'User'
  const initials = userName.split(/\s+/).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  const tenantName = activeTenant?.display_name || defaultOrgName
  const projectName = activeProject?.name
  const contextLine = projectName ? `${tenantName} / ${projectName}` : tenantName

  const statusMapping = isLocal ? 'local' : isConnected ? 'connected' : 'disconnected'

  return (
    <div className={`shrink-0 relative ${expanded ? 'px-3 pb-3' : 'flex flex-col items-center pb-3'}`}>
      <Button
        variant={expanded ? 'navTrigger' : 'ghost'}
        size={expanded ? 'md' : 'icon-lg'}
        onClick={() => setOpen(!open)}
        title={expanded ? undefined : `${userName} · ${contextLine}`}
        className={cn(!expanded && 'w-10 h-10')}
      >
        <Avatar
          src={currentUser?.avatar_url}
          fallback={initials}
          status={statusMapping}
          size="md"
        />
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
      {open && (
        <div className="absolute z-50 bg-popover border border-border rounded-lg shadow-xl min-w-[220px] bottom-full mb-1 p-2">
           <p className="text-xs font-semibold px-2 py-1">Context</p>
           <div className="h-px bg-border my-1 mx-1" />
           <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="w-full justify-start text-xs">Close</Button>
        </div>
      )}
    </div>
  )
}
