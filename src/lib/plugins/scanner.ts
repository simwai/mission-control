/**
 * Plugin Scanner (Simulation)
 */
import { pluginRegistry } from './registry'
import { logger } from '../logger'
import { JulesPlugin } from '@/plugins/jules-clone'

export function scanAndLoadPlugins() {
  const discoveredPlugins = [
    JulesPlugin
  ]

  discoveredPlugins.forEach(plugin => {
    pluginRegistry.registerPlugin(plugin)
    if (typeof window === 'undefined' && plugin.onServerInit) {
      plugin.onServerInit()
    }
  })

  logger.info(`Discovered and registered ${discoveredPlugins.length} plugins.`)
}
