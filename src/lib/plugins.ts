/**
 * Unified Plugin & Panel Registry
 */
import type { ComponentType } from 'react'

export interface PluginIntegrationDef {
  id: string
  name: string
  category: string
  envVars: string[]
  testable?: boolean
  testHandler?: (envMap: Map<string, string>) => Promise<{ ok: boolean; detail: string }>
}

export interface PluginNavItem {
  id: string
  label: string
  icon?: string
  groupId: string
  gatewayOnly?: boolean
}

const _integrations: PluginIntegrationDef[] = []
const _navItems: PluginNavItem[] = []
const _panels: Map<string, ComponentType> = new Map()

export function registerPanel(id: string, component: ComponentType): void {
  _panels.set(id, component)
}

export function getPanel(id: string): ComponentType | undefined {
  return _panels.get(id)
}

export function registerNavItems(items: PluginNavItem[]): void {
  _navItems.push(...items)
}

export function getNavItems(): PluginNavItem[] {
  return _navItems
}

export function registerIntegrations(defs: PluginIntegrationDef[]): void {
  _integrations.push(...defs)
}

export function getIntegrations(): PluginIntegrationDef[] {
  return _integrations
}
