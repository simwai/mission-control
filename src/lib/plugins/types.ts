import { ComponentType, LazyExoticComponent } from 'react'

export interface PluginMetadata {
  id: string
  name: string
  version: string
  description?: string
  author?: string
}

export type PanelComponent = ComponentType<any> | LazyExoticComponent<any>

export interface MissionControlPlugin {
  metadata: PluginMetadata
  /** Called on the server during startup */
  onServerInit?: () => void | Promise<void>
  /** Called on the client during initialization */
  onClientInit?: () => void | Promise<void>
  /** UI Panels provided by this plugin */
  panels?: Record<string, PanelComponent>
  /** Navigation items provided by this plugin */
  navItems?: PluginNavItem[]
  /** Extension hooks */
  hooks?: Record<string, Function>
}

export interface PluginNavItem {
  id: string
  label: string
  icon?: string
  groupId: string
  gatewayOnly?: boolean
}
