'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMissionControl } from '@/store'
import { useNavigateToPanel } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
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
      { id: 'overview', label: 'Overview', icon: <Icons.OverviewIcon size={18} />, priority: true, essential: true },
      { id: 'agents', label: 'Agents', icon: <Icons.AgentsIcon size={18} />, priority: true, essential: true },
      { id: 'tasks', label: 'Tasks', icon: <Icons.TasksIcon size={18} />, priority: true, essential: true },
      { id: 'chat', label: 'Chat', icon: <Icons.ChatIcon size={18} />, priority: false, essential: true },
      { id: 'channels', label: 'Channels', icon: <Icons.ChannelsIcon size={18} />, priority: false },
      { id: 'skills', label: 'Skills', icon: <Icons.SkillsIcon size={18} />, priority: false },
      { id: 'memory', label: 'Memory', icon: <Icons.MemoryIcon size={18} />, priority: false },
    ],
  },
  {
    id: 'observe',
    label: 'OBSERVE',
    items: [
      { id: 'activity', label: 'Activity', icon: <Icons.ActivityIcon size={18} />, priority: true, essential: true },
      { id: 'logs', label: 'Logs', icon: <Icons.LogsIcon size={18} />, priority: false, essential: true },
      { id: 'cost-tracker', label: 'Cost Tracker', icon: <Icons.TokensIcon size={18} />, priority: false },
      { id: 'nodes', label: 'Nodes', icon: <Icons.NodesIcon size={18} />, priority: false },
      { id: 'exec-approvals', label: 'Approvals', icon: <Icons.ApprovalsIcon size={18} />, priority: false },
      { id: 'office', label: 'Office', icon: <Icons.OfficeIcon size={18} />, priority: false },
      { id: 'monitor', label: 'Monitor', icon: <Icons.MonitorIcon size={18} />, priority: false },
    ],
  },
  {
    id: 'automate',
    label: 'AUTOMATE',
    items: [
      { id: 'cron', label: 'Cron', icon: <Icons.CronIcon size={18} />, priority: false },
      { id: 'webhooks', label: 'Webhooks', icon: <Icons.WebhookIcon size={18} />, priority: false },
      { id: 'alerts', label: 'Alerts', icon: <Icons.AlertIcon size={18} />, priority: false },
      { id: 'github', label: 'GitHub', icon: <Icons.GitHubIcon size={18} />, priority: false },
    ],
  },
  {
    id: 'admin',
    label: 'ADMIN',
    items: [
      { id: 'security', label: 'Security', icon: <Icons.SecurityIcon size={18} />, priority: false },
      { id: 'users', label: 'Users', icon: <Icons.UsersIcon size={18} />, priority: false },
      { id: 'audit', label: 'Audit', icon: <Icons.AuditIcon size={18} />, priority: false },
      { id: 'gateways', label: 'Gateways', icon: <Icons.GatewaysIcon size={18} />, priority: false },
      { id: 'gateway-config', label: 'Config', icon: <Icons.GatewayConfigIcon size={18} />, priority: false },
      { id: 'integrations', label: 'Integrations', icon: <Icons.IntegrationsIcon size={18} />, priority: false },
      { id: 'debug', label: 'Debug', icon: <Icons.DebugIcon size={18} />, priority: false },
      { id: 'settings', label: 'Settings', icon: <Icons.SettingsIcon size={18} />, priority: false, essential: true },
    ],
  },
]

export function NavRail() {
  const { activeTab, connection, dashboardMode, currentUser, activeTenant, tenants, osUsers, setActiveTenant, fetchTenants, fetchOsUsers, activeProject, projects, setActiveProject, fetchProjects, sidebarExpanded, toggleSidebar, defaultOrgName, interfaceMode, setInterfaceMode } = useMissionControl()
  const navigateToPanel = useNavigateToPanel()
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
            <Icons.ChevronUpIcon size={16} className={sidebarExpanded ? "rotate-90" : "rotate-270"} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {mergedGroups.map((group) => (
            <div key={group.id} className="px-2 py-1">
              {sidebarExpanded && group.label && (
                <div className="px-3 mt-3 mb-1">
                  <span className="text-[10px] tracking-wider text-muted-foreground/60 font-semibold uppercase">{group.label}</span>
                </div>
              )}
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
