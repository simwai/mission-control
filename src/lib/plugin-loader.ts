import { initCorePanels } from './core-panels'
import { scanAndLoadPlugins } from './plugins/scanner'
import { pluginRegistry } from './plugins/registry'

export function loadPlugins(): void {
  // 1. Initialize core system panels
  initCorePanels()

  // 2. Discover and register dynamic plugins
  scanAndLoadPlugins()

  // 3. Trigger client-side initialization
  if (typeof window !== 'undefined') {
    pluginRegistry.getAllPlugins().forEach(plugin => {
      if (plugin.onClientInit) plugin.onClientInit()
    })
  }

  console.log('Plugin loading sequence complete.')
}
