import { MissionControlPlugin, PanelComponent, PluginNavItem } from './types'
import { logger } from '../logger'

class PluginRegistry {
  private plugins = new Map<string, MissionControlPlugin>()
  private panels = new Map<string, PanelComponent>()
  private navItems: PluginNavItem[] = []

  registerPlugin(plugin: MissionControlPlugin) {
    if (this.plugins.has(plugin.metadata.id)) {
      logger.warn(`Plugin ${plugin.metadata.id} is already registered.`)
      return
    }

    this.plugins.set(plugin.metadata.id, plugin)

    if (plugin.panels) {
      Object.entries(plugin.panels).forEach(([id, component]) => {
        this.registerPanel(id, component)
      })
    }

    if (plugin.navItems) {
      this.registerNavItems(plugin.navItems)
    }
  }

  registerPanel(id: string, component: PanelComponent) {
    this.panels.set(id, component)
  }

  registerNavItems(items: PluginNavItem[]) {
    this.navItems.push(...items)
  }

  getPlugin(id: string) {
    return this.plugins.get(id)
  }

  getPanel(id: string) {
    return this.panels.get(id)
  }

  getAllNavItems() {
    return [...this.navItems]
  }

  getAllPlugins() {
    return Array.from(this.plugins.values())
  }
}

export const pluginRegistry = new PluginRegistry()

// Helper exports for core systems
export const registerPanel = (id: string, component: PanelComponent) => pluginRegistry.registerPanel(id, component)
export const registerNavItems = (items: PluginNavItem[]) => pluginRegistry.registerNavItems(items)
export const registerPlugin = (plugin: MissionControlPlugin) => pluginRegistry.registerPlugin(plugin)
