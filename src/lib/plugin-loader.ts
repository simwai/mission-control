/**
 * Plugin Loader
 */
import { initJulesPlugin } from '@/plugins/jules-clone'

export function loadPlugins(): void {
  // Initialize registered plugins
  initJulesPlugin()

  // Potential for dynamic loading based on env or DB settings
  console.log('Core plugins loaded')
}
