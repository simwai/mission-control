/**
 * Plugin Loader
 */
import { initCorePanels } from './core-panels'
import { initJulesPlugin } from '@/plugins/jules-clone'

export function loadPlugins(): void {
  // 1. Initialize core system panels
  initCorePanels()

  // 2. Initialize extension plugins
  initJulesPlugin()

  console.log('All panels and plugins initialized')
}
