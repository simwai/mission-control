'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useMissionControl } from '@/store'
import { useNavigateToPanel, usePrefetchPanel } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
import { APP_VERSION } from '@/lib/version'
import { pluginRegistry } from '@/lib/plugins'
import { NavButton } from './nav/nav-button'
import { MobileBottomBar } from './nav/mobile-bottom-bar'
import { ContextSwitcher } from './nav/context-switcher'
import * as Icons from '@/components/icons'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  priority: boolean
  essential?: boolean
  children?: NavItem[]
}

interface NavGroup {
  id: string
  label?: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    id: 'core',
    items: [
      { id: 'overview', label: 'Overview', icon: <Icons.OverviewIcon />, priority: true, essential: true },
      { id: 'agents', label: 'Agents', icon: <Icons.AgentsIcon />, priority: true, essential: true },
      { id: 'tasks', label: 'Tasks', icon: <Icons.TasksIcon />, priority: true, essential: true },
      { id: 'chat', label: 'Chat', icon: <Icons.ChatIcon />, priority: false, essential: true },
      { id: 'channels', label: 'Channels', icon: <Icons.ChannelsIcon />, priority: false },
      { id: 'skills', label: 'Skills', icon: <Icons.SkillsIcon />, priority: false },
      { id: 'memory', label: 'Memory', icon: <Icons.MemoryIcon />, priority: false },
    ],
  },
  {
    id: 'observe',
    label: 'OBSERVE',
    items: [
      { id: 'activity', label: 'Activity', icon: <Icons.ActivityIcon />, priority: true, essential: true },
      { id: 'logs', label: 'Logs', icon: <Icons.LogsIcon />, priority: false, essential: true },
      { id: 'cost-tracker', label: 'Cost Tracker', icon: <Icons.TokensIcon />, priority: false },
      { id: 'nodes', label: 'Nodes', icon: <Icons.NodesIcon />, priority: false },
      { id: 'exec-approvals', label: 'Approvals', icon: <Icons.ApprovalsIcon />, priority: false },
      { id: 'office', label: 'Office', icon: <Icons.OfficeIcon />, priority: false },
      { id: 'monitor', label: 'Monitor', icon: <Icons.MonitorIcon />, priority: false },
    ],
  },
]

export function NavRail() {
  const { activeTab, connection, dashboardMode, currentUser, activeTenant, tenants, osUsers, setActiveTenant, fetchTenants, fetchOsUsers, activeProject, projects, setActiveProject, fetchProjects, sidebarExpanded, collapsedGroups, toggleSidebar, toggleGroup, defaultOrgName, interfaceMode, setInterfaceMode } = useMissionControl()
  const navigateToPanel = useNavigateToPanel()
  const prefetchPanel = usePrefetchPanel()
  const tn = useTranslations('nav')
  const isLocal = dashboardMode === 'local'
  const isAdmin = currentUser?.role === 'admin'

  const mergedGroups = navGroups.map(g => {
    const pluginItems = pluginRegistry.getAllNavItems()
      .filter(pi => pi.groupId === g.id)
      .map(pi => ({
        id: pi.id,
        label: pi.label,
        icon: <span>{pi.icon || '🧩'}</span>,
        priority: false,
      } as NavItem))
    return { ...g, items: [...g.items, ...pluginItems] }
  })

  return (
    <>
      <nav className={`hidden md:flex flex-col bg-gradient-to-b from-card to-background border-r border-border shrink-0 transition-all duration-200 ${sidebarExpanded ? 'w-[220px]' : 'w-14'}`}>
        <div className={`flex items-center shrink-0 ${sidebarExpanded ? 'px-3 py-3 gap-2.5' : 'flex-col py-3 gap-2'}`}>
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-background border border-border/50 flex items-center justify-center shrink-0">
            <Image src="/brand/mc-logo-128.png" alt="Logo" width={36} height={36} />
          </div>
          {sidebarExpanded && <span className="text-sm font-semibold truncate flex-1">Mission Control</span>}
          <Button variant="ghost" size="icon-xs" onClick={toggleSidebar}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" className="w-4 h-4">
              <polyline points={sidebarExpanded ? "10,3 5,8 10,13" : "6,3 11,8 6,13"} />
            </svg>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {mergedGroups.map((group) => (
            <div key={group.id} className="px-2 py-1">
              {group.items.map(item => (
                <NavButton key={item.id} item={item} active={activeTab === item.id} expanded={sidebarExpanded} onClick={() => navigateToPanel(item.id)} />
              ))}
            </div>
          ))}
        </div>

        <ContextSwitcher
          currentUser={currentUser} isAdmin={isAdmin} isLocal={isLocal} isConnected={connection.isConnected}
          tenants={tenants} osUsers={osUsers} activeTenant={activeTenant} onSwitchTenant={setActiveTenant}
          projects={projects} activeProject={activeProject} onSwitchProject={setActiveProject}
          expanded={sidebarExpanded} defaultOrgName={defaultOrgName} navigateToPanel={navigateToPanel}
          fetchTenants={fetchTenants} fetchOsUsers={fetchOsUsers} interfaceMode={interfaceMode}
          setInterfaceMode={setInterfaceMode} activeTab={activeTab}
        />
      </nav>

      <MobileBottomBar activeTab={activeTab} navigateToPanel={navigateToPanel} groups={mergedGroups} items={mergedGroups.flatMap(g => g.items)} />
    </>
  )
}
