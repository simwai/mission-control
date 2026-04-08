/**
 * Plugin Loader
 *
 * Implements a dynamic registration pattern where plugins provide
 * metadata and an init interface.
 */
import { initCorePanels } from './core-panels'
import { registerPlugin, getRegisteredPlugins } from './plugins'
import { JulesPlugin } from '@/plugins/jules-clone'

export function loadPlugins(): void {
  // 1. Register core system panels (non-plugin)
  initCorePanels()

  // 2. Register available plugins
  registerPlugin(JulesPlugin)

  // 3. Initialize all registered plugins
  const plugins = getRegisteredPlugins()
  for (const plugin of plugins) {
    try {
      plugin.init()
      console.log(`Plugin "${plugin.metadata.name}" (v${plugin.metadata.version}) initialized.`)
    } catch (err) {
      console.error(`Failed to initialize plugin "${plugin.metadata.id}":`, err)
    }
  }
}
