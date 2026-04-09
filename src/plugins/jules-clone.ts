import { MissionControlPlugin } from '@/lib/plugins/types'
import { lazy } from 'react'
import { useMissionControl } from '@/store'
import { registerAgentTemplate } from '@/lib/agent-templates'
import { createClientLogger } from '@/lib/client-logger'

const log = createClientLogger('JulesPlugin')

// Lazy loaded dashboard
const JulesDashboard = lazy(() => import('./jules-dashboard'))

export const JulesPlugin: MissionControlPlugin = {
  metadata: {
    id: 'jules',
    name: 'Jules AI Developer',
    version: '2.1.0',
    description: 'High-autonomy autonomous developer extension.',
    author: 'Builderz Labs'
  },

  panels: {
    'jules': JulesDashboard
  },

  navItems: [
    {
      id: 'jules',
      label: 'Jules AI',
      groupId: 'automate',
      icon: '🧪'
    }
  ],

  onClientInit: () => {
    const { registerPluginState } = useMissionControl.getState()

    // Inject specialized state for Jules
    registerPluginState('jules', {
      autonomyLevel: 'high',
      lastAction: 'Repository mapping completed',
      diagnostics: {
        gitStatus: 'clean',
        buildStatus: 'passing'
      }
    })

    // Register the agent template dynamically
    registerAgentTemplate({
      type: 'jules-clone',
      label: 'Jules (AI Developer)',
      description: 'The ultimate autonomous coding agent.',
      emoji: '🧪',
      modelTier: 'sonnet',
      toolCount: 28,
      config: {
        model: { primary: 'anthropic/claude-3-5-sonnet-latest', fallbacks: [] },
        identity: { name: 'Jules', theme: 'autonomous developer', emoji: '🧪' },
        sandbox: { mode: 'all', workspaceAccess: 'rw', scope: 'agent' },
        tools: { allow: ['*'], deny: [] },
      }
    })

    log.info('Jules Plugin: Dynamic state and template registered.')
  }
}
