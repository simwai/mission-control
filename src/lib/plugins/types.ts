import { ComponentType, LazyExoticComponent } from 'react'

export interface PluginMetadata {
  id: string
  name: string
  version: string
  description?: string
  author?: string
  permissions?: string[]
}

export type PanelComponent = ComponentType<any> | LazyExoticComponent<any>

/**
 * Standard Plugin Interface (Discord-style)
 */
export interface MissionControlPlugin {
  readonly metadata: PluginMetadata

  // Lifecycle hooks
  onServerInit?: () => void | Promise<void>
  onClientInit?: () => void | Promise<void>

  // Registration data
  panels?: Record<string, PanelComponent>
  navItems?: PluginNavItem[]

  // Event Handlers (Observer Pattern)
  events?: Record<string, (data: any) => void>

  // Custom Commands / Tools
  commands?: Record<string, (args: any) => Promise<any>>
}

export interface PluginNavItem {
  id: string
  label: string
  icon?: string
  groupId: string
  gatewayOnly?: boolean
}
