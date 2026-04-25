'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useMissionControl } from '@/store'
import { cn } from '@/lib/utils'
import { ChevronUpIcon, SettingsIcon, ActivityIcon } from '@/components/icons'

export function ContextSwitcher({ currentUser, isAdmin, isLocal, isConnected, tenants, osUsers, activeTenant, onSwitchTenant, projects, activeProject, onSwitchProject, expanded, defaultOrgName, navigateToPanel, fetchTenants, fetchOsUsers, interfaceMode, setInterfaceMode, activeTab }: any) {
  const { setShowProjectManagerModal } = useMissionControl()
  const tcs = useTranslations('contextSwitcher')
  const tn = useTranslations('nav')
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
            <ChevronUpIcon size={14} className="shrink-0 text-muted-foreground/50" />
          </>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={cn(
            "absolute z-50 bg-popover border border-border rounded-lg shadow-xl min-w-[220px] bottom-full mb-1",
            expanded ? "left-0 right-0" : "left-full ml-2"
          )}>
            <div className="p-3 border-b border-border">
              <p className="text-sm font-semibold truncate">{userName}</p>
              <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{currentUser?.role || 'User'}</p>
            </div>

            <div className="p-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => { navigateToPanel('settings'); setOpen(false) }}
              >
                <SettingsIcon size={14} />
                {tn('settings')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => { navigateToPanel('activity'); setOpen(false) }}
              >
                <ActivityIcon size={14} />
                {tn('activity')}
              </Button>
            </div>

            <div className="p-1 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setOpen(false)}
              >
                Sign Out (Refactored)
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
