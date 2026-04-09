/**
 * Plugin Loader
 */
import { initCorePanels } from './core-panels'
import { scanAndLoadPlugins } from './plugins/scanner'
import { pluginRegistry } from './plugins/registry'
import { logger } from './logger'

export function loadPlugins(): void {
  // 1. Initialize core system panels
  initCorePanels()

  // 2. Discover and register dynamic plugins
  scanAndLoadPlugins()

  // 3. Trigger client-side initialization
  if (typeof window !== 'undefined') {
    pluginRegistry.getAllPlugins().forEach(plugin => {
      try {
        if (plugin.onClientInit) plugin.onClientInit()
      } catch (err) {
        logger.error(`Failed to initialize plugin client-side "${plugin.metadata.id}":`, err)
      }
    })
  }

  logger.info('Plugin loading sequence complete.')
}
