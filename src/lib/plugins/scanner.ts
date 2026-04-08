/**
 * Plugin Scanner (Simulation)
 * In a real environment, this would use fs.readdir and dynamic imports.
 * For this sandbox, we maintain an explicit list of discoverable plugins.
 */
import { pluginRegistry } from './registry'
import { JulesPlugin } from '@/plugins/jules-clone'

export function scanAndLoadPlugins() {
  // Discovery logic (represented explicitly here for sandbox compatibility)
  const discoveredPlugins = [
    JulesPlugin
  ]

  discoveredPlugins.forEach(plugin => {
    pluginRegistry.register(plugin)
    if (typeof window === 'undefined' && plugin.onServerInit) {
      plugin.onServerInit()
    }
  })

  console.log(`Discovered and registered ${discoveredPlugins.length} plugins.`)
}
