/**
 * Jules Clone Plugin
 */
import { registerPanel, registerNavItems, MissionControlPlugin } from '@/lib/plugins'
import { registerAgentTemplate } from '@/lib/agent-templates'
import { createElement } from 'react'
import { useMissionControl } from '@/store'

function JulesDashboard() {
  const { agents, tasks } = useMissionControl()

  return createElement('div', { className: 'p-8 space-y-6' },
    createElement('div', { className: 'flex items-center gap-3' },
      createElement('span', { className: 'text-3xl' }, '🧪'),
      createElement('h1', { className: 'text-2xl font-bold' }, 'Jules AI Developer')
    ),
    createElement('p', { className: 'text-muted-foreground' },
      `Jules mode active. Monitoring ${agents.length} agents across ${tasks.length} tasks.`)
  )
}

export const JulesPlugin: MissionControlPlugin = {
  metadata: {
    id: 'jules',
    name: 'Jules AI Developer',
    version: '1.0.0',
    description: 'Autonomous coding workflow extension.',
    author: 'Builderz Labs'
  },
  init: () => {
    // 1. Register UI
    registerPanel('jules', JulesDashboard)

    // 2. Register Navigation
    registerNavItems([
      {
        id: 'jules',
        label: 'Jules AI',
        groupId: 'automate',
        icon: '🧪'
      }
    ])

    // 3. Register specialized Agent Template
    registerAgentTemplate({
      type: 'jules-clone',
      label: 'Jules (AI Developer)',
      description: 'High-autonomy developer agent with deep repo context.',
      emoji: '🧪',
      modelTier: 'sonnet',
      toolCount: 25,
      config: {
        model: { primary: 'anthropic/claude-3-5-sonnet-latest', fallbacks: [] },
        identity: { name: '', theme: 'jules developer', emoji: '🧪' },
        sandbox: { mode: 'all', workspaceAccess: 'rw', scope: 'agent' },
        tools: { allow: ['*'], deny: [] },
      }
    })
  }
}
